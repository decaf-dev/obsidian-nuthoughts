import { Notice, Plugin } from "obsidian";
import { ChildProcess, spawn } from "child_process";
import * as os from "os";
import * as path from "path";
import * as net from "net";

import SettingsTab from "./settings-tab";
import {
	getCACertPath,
	getCAKeyPath,
	getPluginPath,
	getVaultPath,
} from "./utils";
import { issueCertificate } from "./tls";

interface NuThoughtsSettings {
	serverPort: number;
	heartbeatPort: number;
	shouldRunOnStartup: boolean;
	certCommonName: string;
	useHostNameAsCommonName: boolean;
	saveFolder: string;
}

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	shouldRunOnStartup: true,
	serverPort: 8123,
	heartbeatPort: 8124,
	certCommonName: "",
	useHostNameAsCommonName: true,
	saveFolder: "",
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
		this.setupProcessConnection();

		const vaultPath = getVaultPath(this.app);
		const pluginPath = getPluginPath(this.app, true);
		const serverPath = path.join(pluginPath, "server");
		const savePath = path.join(vaultPath, this.settings.saveFolder);

		const caKey = await this.app.vault.adapter.read(
			getCAKeyPath(this.app, false)
		);
		const caCert = await this.app.vault.adapter.read(
			getCACertPath(this.app, false)
		);

		const computerHostName = os.hostname().toLowerCase();
		const certCommonName = this.settings.useHostNameAsCommonName
			? computerHostName
			: this.settings.certCommonName;

		const cert = issueCertificate(
			certCommonName,
			[certCommonName, "localhost"],
			caKey,
			caCert
		);

		const childProcess = spawn(`${serverPath}`, [
			this.settings.serverPort.toString(),
			this.settings.heartbeatPort.toString(),
			certCommonName,
			cert.privateKey,
			cert.certificate,
			savePath,
		]);

		childProcess.stdout.on("data", (data) => {
			console.log(data.toString());
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

	private setupProcessConnection() {
		const server = net.createServer((socket) => {
			socket.on("end", () => {
				console.log("Client disconnected");
			});
		});

		server.listen(this.settings.heartbeatPort, () => {
			// console.log(
			// 	`Heartbeat server listening on port: ${this.settings.heartbeatPort}`
			// );
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
