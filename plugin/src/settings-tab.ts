import { App, PluginSettingTab, Setting } from "obsidian";
import NuThoughtsPlugin from "./main";

export default class SettingsTab extends PluginSettingTab {
	plugin: NuThoughtsPlugin;

	constructor(app: App, plugin: NuThoughtsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Run on start up")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.shouldRunOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.shouldRunOnStartup = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Server path")
			.setDesc(
				"The path to the server executable, excluding the server name. e.g. /users/trey/desktop"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.serverPath)
					.onChange(async (value) => {
						this.plugin.settings.serverPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Port")
			.setDesc(
				"The port to run the http server on. Defaults to 8123 if not set"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.serverPort.toString())
					.onChange(async (value) => {
						this.plugin.settings.serverPort = Number(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Port")
			.setDesc(
				"The port to run the heartbeat server on. This is necessary to clean up the child process when Obsidian closes. Defaults to 8124 if not set"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.heartbeatPort.toString())
					.onChange(async (value) => {
						this.plugin.settings.heartbeatPort = Number(value);
						await this.plugin.saveSettings();
					})
			);
	}
}
