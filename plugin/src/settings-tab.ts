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

		new Setting(containerEl).setHeading().setName("Server");

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
			.setName("Server port")
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
			.setName("Heartbeat port")
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

		new Setting(containerEl).setHeading().setName("TLS");

		new Setting(containerEl)
			.setName("Use computer hostname as certificate common name")
			.setDesc(
				"If enabled, the certificate common name will be set to the hostname of your computer."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useHostNameAsCommonName)
					.onChange(async (value) => {
						this.plugin.settings.useHostNameAsCommonName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Certificate common name")
			.setDesc(
				"The common name to use for the self-signed certificate. Defaults to the hostname of your computer if not set"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.certCommonName)
					.onChange(async (value) => {
						this.plugin.settings.certCommonName = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
