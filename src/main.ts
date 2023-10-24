import { Notice, Plugin } from "obsidian";
import { ChildProcess, exec } from "child_process";
import * as fs from "fs";

import NuThoughtsSettingsTab from "./nuthoughts-settings-tab";

interface NuThoughtsSettings {
	port: number;
	shouldRunOnStartup: boolean;
	serverFilePath: string;
	bunPath: string;
}

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	shouldRunOnStartup: true,
	port: 8555,
	serverFilePath: "",
	bunPath: "",
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
				new Notice("Starting NuThoughts server");
				this.runServer();
			},
		});

		this.addCommand({
			id: "stop-server",
			name: "Stop server",
			callback: () => {
				new Notice("Stopping NuThoughts server");
				this.stopServer();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new NuThoughtsSettingsTab(this.app, this));

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
		const exists = fs.existsSync(this.settings.serverFilePath);
		if (!exists) {
			new Notice(
				"NuThoughts cannot find server.js. Please check the plugin settings"
			);
			return;
		}

		const title = "NuThoughts server";
		const child = exec(
			`${this.settings.bunPath} ${this.settings.serverFilePath}`,
			(error: any, stdout: any, stderr: any) => {
				console.log(`${title} error: ${error}`);
				console.log(`${title} stdout: ${stdout}`);
				console.log(`${title} stderr: ${stderr}`);
			}
		);
		this.serverProcess = child;

		process.on("exit", () => {
			child.kill();
		});

		process.on("SIGINT", () => {
			child.kill();
			process.exit(1); // or process.exitCode = 1;
		});

		process.on("SIGTERM", () => {
			child.kill();
			process.exit(1); // or process.exitCode = 1;
		});

		new Notice(
			"NuThoughts server is running on port " + this.settings.port
		);
		this.isServerRunning = true;
	}

	private stopServer() {
		if (!this.serverProcess) {
			return;
		}

		this.updateServerStatus(false);
		this.isServerRunning = false;
		this.serverProcess.kill();
		this.serverProcess = null;
	}

	private updateServerStatus(isOn: boolean) {
		let text = "NuThoughts stopped";
		if (isOn) text = "NuThoughts running";

		this.serverStatusEl.setText(text);
	}
}
