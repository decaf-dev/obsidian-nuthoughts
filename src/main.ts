import { Notice, Plugin } from "obsidian";
import * as fs from "fs";
import { exec } from "child_process";

import NuThoughtsSettingsTab from "./nuthoughts-settings-tab";

interface NuThoughtsSettings {
	port: number;
	shouldRunOnStartup: boolean;
	serverFilePath: string;
}

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	shouldRunOnStartup: true,
	port: 8555,
	serverFilePath: "server.js",
};

export default class NuThoughtsPlugin extends Plugin {
	settings: NuThoughtsSettings;
	serverStatusEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "run-server",
			name: "Run NuThoughts server",
			callback: () => {
				new Notice("Starting NuThoughts server");
				this.runServer();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new NuThoughtsSettingsTab(this.app, this));

		this.serverStatusEl = this.addStatusBarItem();
		this.updateServerStatus(false);

		if (this.settings.shouldRunOnStartup) {
			this.runServer();
		}
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

	private runServer() {
		this.updateServerStatus(true);
		if (!fs.existsSync(this.settings.serverFilePath)) {
			new Notice("Server file not found");
			return;
		}
		exec(
			`bun ${this.settings.serverFilePath}`,
			(error: any, stdout: any, stderr: any) => {
				console.log(stdout);
			}
		);
		new Notice("Server is running on port " + this.settings.port);
	}

	private stopServer() {
		this.updateServerStatus(false);
	}

	private updateServerStatus(isOn: boolean) {
		let text = "NuThoughts stopped";
		if (isOn) {
			text = "NuThoughts running";
		}
		this.serverStatusEl.setText(text);
	}
}
