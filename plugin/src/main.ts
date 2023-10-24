import { Notice, Plugin } from "obsidian";
import { ChildProcess, spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as net from "net";

import SettingsTab from "./settings-tab";

interface NuThoughtsSettings {
	serverPort: number;
	heartbeatPort: number;
	shouldRunOnStartup: boolean;
	serverPath: string;
}

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	shouldRunOnStartup: true,
	serverPort: 8123,
	heartbeatPort: 8124,
	serverPath: "",
};

export default class NuThoughtsPlugin extends Plugin {
	settings: NuThoughtsSettings;
	serverStatusEl: HTMLElement;
	isServerRunning: boolean;
	serverProcess: ChildProcess | null;
	heartbeatServer: net.Server | null;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "start-server",
			name: "Start server",
			callback: () => {
				this.runServer();
			},
		});

		this.addCommand({
			id: "stop-server",
			name: "Stop server",
			callback: () => {
				this.stopServer();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		this.serverStatusEl = this.addStatusBarItem();
		this.updateServerStatus(false);

		this.app.workspace.onLayoutReady(async () => {
			if (this.settings.shouldRunOnStartup) {
				this.runServer();
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async runServer() {
		if (this.isServerRunning) {
			new Notice("NuThoughts server is already running");
			return;
		}

		this.updateServerStatus(true);
		const exists = fs.existsSync(this.settings.serverPath);
		if (!exists) {
			new Notice(
				"NuThoughts cannot find the server executable. Please update the server path in the plugin settings."
			);
			return;
		}

		this.setupHeartbeat();

		const serverPath = path.join(this.settings.serverPath, "server");
		const childProcess = spawn(`${serverPath}`, [
			"server",
			this.settings.serverPort.toString(),
			this.settings.heartbeatPort.toString(),
		]);

		childProcess.stdout.on("data", (data) => {
			console.log(data.toString().trim());
		});
		childProcess.stderr.on("data", (data) => {
			console.error(data.toString());
			if (data.includes("EADDRINUSE")) {
				new Notice("NuThoughts server failed to start");
				this.isServerRunning = false;
				return;
			} else {
				this.stopServer();
			}
		});

		this.serverProcess = childProcess;
		this.isServerRunning = true;
	}

	private setupHeartbeat() {
		const server = net.createServer((socket) => {
			socket.on("end", () => {
				console.log("Client disconnected");
			});
		});

		server.listen(this.settings.heartbeatPort, () => {
			console.log(
				`Heartbeat server listening on port: ${this.settings.heartbeatPort}`
			);
		});
		this.heartbeatServer = server;
	}

	private stopServer() {
		if (!this.isServerRunning) {
			new Notice("NuThoughts server is already stopped");
			return;
		}

		this.updateServerStatus(false);
		this.isServerRunning = false;
		this.serverProcess?.kill();
		this.serverProcess = null;
		this.heartbeatServer?.close();
		this.heartbeatServer = null;
		new Notice("Stopped NuThoughts server");
	}

	private updateServerStatus(isOn: boolean) {
		let text = "NuThoughts stopped";
		if (isOn) text = "NuThoughts running";

		this.serverStatusEl.setText(text);
	}
}
