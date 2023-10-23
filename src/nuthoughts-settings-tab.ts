import { App, PluginSettingTab, Setting } from "obsidian";
import NuThoughtsPlugin from "./main";

export default class NuThoughtsSettingsTab extends PluginSettingTab {
	plugin: NuThoughtsPlugin;

	constructor(app: App, plugin: NuThoughtsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

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
