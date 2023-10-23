import { Notice, Plugin } from "obsidian";

import NuThoughtsSettingsTab from "./nuthoughts-settings-tab";

interface NuThoughtsSettings {
	port: number;
}

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	port: 8555,
};

export default class NuThoughtsPlugin extends Plugin {
	settings: NuThoughtsSettings;
	serverStatusEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "run-server",
			name: "Run NuThoughts server",
			checkCallback: () => {
				new Notice("Starting NuThoughts server");
				this.runServer();
				return true;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new NuThoughtsSettingsTab(this.app, this));

		this.serverStatusEl = this.addStatusBarItem();
		this.updateServerStatus(false);
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
	}

	private stopServer() {
		this.updateServerStatus(false);
	}

	private updateServerStatus(isOn: boolean) {
		let text = "NuThoughts server stopped";
		if (isOn) {
			text = "NuThoughts server running";
		}
		this.serverStatusEl.setText(text);
	}
}
