import { App, Notice, PluginSettingTab, Setting } from "obsidian";

import { exec } from "child_process";

import NuThoughtsPlugin from "../main";
import { createCertificateAuthority } from "../tls";
import { getCACertPath, getCAKeyPath, getPluginPath } from "../utils";

export default class NuThoughtsSettingsTab extends PluginSettingTab {
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

		new Setting(containerEl)
			.setName("Save folder")
			.setDesc(
				"The folder to save thoughts to. Defaults to the vault root"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.saveFolder)
					.onChange(async (value) => {
						this.plugin.settings.saveFolder = value;
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
				"The common name to use for the self-signed certificate. This will be used if the above setting is disabled."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.certCommonName)
					.onChange(async (value) => {
						this.plugin.settings.certCommonName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Generate certificate authority")
			.setDesc(
				"Generates a new CA certificate and private key. You will need to install this certificate on your devices."
			)
			.addButton((btn) =>
				btn.setButtonText("Generate").onClick(async () => {
					try {
						const result = createCertificateAuthority();

						const caCertPath = getCACertPath(this.app, false);
						const privateKeyPath = getCAKeyPath(this.app, false);
						const pluginPath = getPluginPath(this.app, true);

						await this.app.vault.adapter.write(
							caCertPath,
							result.certificate
						);
						await this.app.vault.adapter.write(
							privateKeyPath,
							result.privateKey
						);
						new Notice(
							`Generated certificate authority at: ${pluginPath}. Please install this certificate on your devices.`
						);
					} catch (err) {
						console.error(err);
					}
				})
			);

		new Setting(containerEl)
			.setName("TLS folder")
			.setDesc(
				"Opens the folder containing TLS certificates and private keys"
			)
			.addButton((btn) =>
				btn.setButtonText("Open").onClick(() => {
					const path = getPluginPath(this.app, true);
					exec(`open -R ${path}`, (error, _stdout, stderr) => {
						if (error) {
							console.error(`Error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.error(`Stderr: ${stderr}`);
							return;
						}
					});
				})
			);
	}
}
