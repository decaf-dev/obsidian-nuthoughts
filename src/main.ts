import { Notice, Plugin } from "obsidian";
import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";

import SettingsTab from "./settings-tab";

interface NuThoughtsSettings {
	port: number;
	shouldRunOnStartup: boolean;
	serverPath: string;
	executionPath: string;
}

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	shouldRunOnStartup: true,
	port: 8555,
	serverPath: "",
	executionPath: "",
};

export default class NuThoughtsPlugin extends Plugin {
	settings: NuThoughtsSettings;
	serverStatusEl: HTMLElement;
	isServerRunning: boolean;
	serverProcess: ChildProcess | null;

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

	onunload() {
		this.stopServer();
	}

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
				"NuThoughts cannot find the server file. Please check the plugin settings"
			);
			return;
		}

		const child = spawn(
			this.settings.executionPath,
			[this.settings.serverPath],
			{
				stdio: ["pipe", "pipe", "pipe", "ipc"], // Use IPC to communicate between parent and child
			}
		);
		this.serverProcess = child;

		console.log(`Created child process: ${child.pid}`);

		let stderrString = "";
		child.stderr?.on("data", (data) => {
			stderrString += data.toString("utf-8");
		});

		child.on("exit", (code) => {
			console.log(`Child exited with code: ${code}`);
			console.log(`Captured stderr:\n${stderrString}`);
		});

		child.on("message", (message) => {
			if (message === "started") {
				console.log("Child started and is monitoring parent.");
			} else if (message === "error") {
				new Notice("NuThoughts server failed to start");
			}
		});
		this.isServerRunning = true;
		new Notice(
			"NuThoughts server is running on port: " + this.settings.port
		);
	}

	private stopServer() {
		if (!this.serverProcess) {
			return;
		}

		this.updateServerStatus(false);
		this.isServerRunning = false;
		this.serverProcess.kill();
		this.serverProcess = null;
		new Notice("Stopped NuThoughts server");
	}

	private updateServerStatus(isOn: boolean) {
		let text = "NuThoughts stopped";
		if (isOn) text = "NuThoughts running";

		this.serverStatusEl.setText(text);
	}
}
