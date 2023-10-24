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
			.setName("Bun path")
			.setDesc(
				"The path to your bun installation. This can be found by doing 'which bun'"
			)
			.addText((text) => {
				text.setValue(this.plugin.settings.executionPath).onChange(
					async (value) => {
						this.plugin.settings.executionPath = value;
						await this.plugin.saveSettings();
					}
				);
			});

		new Setting(containerEl)
			.setName("Server file path")
			.setDesc("The path to the 'server.js' file")
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
				"The port to run the server on. Defaults to 8555 if not set"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.port.toString())
					.onChange(async (value) => {
						this.plugin.settings.port = Number(value);
						await this.plugin.saveSettings();
					})
			);
	}
}
