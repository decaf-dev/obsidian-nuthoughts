import { Notice, Plugin } from "obsidian";

import * as os from "os";

import NuThoughtsSettingsTab from "./obsidian/nuthoughts-settings-tab";
import {
	getCACertPath,
	getCAKeyPath,
} from "./server/utils";
import { issueCertificate } from "./server/certificates";
import Server from "./server";
import { NuThoughtsSettings } from "./types";

const DEFAULT_SETTINGS: NuThoughtsSettings = {
	shouldRunOnStartup: true,
	port: 8123,
	certCommonName: "",
	useHostNameAsCommonName: true,
	saveFolder: "",
};

export default class NuThoughtsPlugin extends Plugin {
	settings: NuThoughtsSettings;
	serverStatusBarEl: HTMLElement;
	isServerRunning: boolean;
	server: Server;

	async onload() {
		this.server = new Server();

		await this.loadSettings();

		this.registerCommands();

		this.addSettingTab(new NuThoughtsSettingsTab(this.app, this));

		this.serverStatusBarEl = this.addStatusBarItem();
		this.updateStatusBar(false);

		this.app.workspace.onLayoutReady(async () => {
			if (this.settings.shouldRunOnStartup) {
				this.runServer();
			}
		});
	}

	onunload() { }

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

	private registerCommands() {
		this.addCommand({
			id: "start-server",
			name: "Start server",
			callback: () => this.runServer()
		});

		this.addCommand({
			id: "stop-server",
			name: "Stop server",
			callback: () => this.stopServer()
		});
	}

	private async runServer() {
		if (this.isServerRunning) {
			new Notice("NuThoughts server is already running");
			return;
		}


		let caCert: string | null = null;
		let caKey: string | null = null;
		try {
			const caKeyPath = getCAKeyPath(this.app);
			const caCertPath = getCACertPath(this.app);

			caCert = await this.app.vault.adapter.read(caCertPath);
			caKey = await this.app.vault.adapter.read(caKeyPath);
		} catch (err) {
			console.error("Cannot start NuThoughts server. Please generate a certificate authority key and certificate from the settings tab.");
			new Notice("Cannot start NuThoughts server. Please generate a certificate authority key and certificate from the settings tab.");
			return;
		}

		const { useHostNameAsCommonName, certCommonName } = this.settings;

		const computerHostName = os.hostname().toLowerCase();
		const commonName = useHostNameAsCommonName
			? computerHostName
			: certCommonName;


		//Issue a new certificate for the server
		//each time the server is started
		const issuedCert = issueCertificate(
			commonName,
			[commonName, "localhost"],
			caKey,
			caCert
		);

		const { port } = this.settings;
		const result = await this.server.start(this.app, this.settings, commonName, port, issuedCert.certificate, issuedCert.privateKey);
		if (!result) return;

		this.isServerRunning = true;
		this.updateStatusBar(true);

		new Notice(`Started NuThoughts server on port ${port}`);
	}

	private stopServer() {
		if (!this.isServerRunning) {
			return;
		}

		this.server.close();
		this.updateStatusBar(false);
		this.isServerRunning = false;
		new Notice("Stopped NuThoughts server");
	}

	private updateStatusBar(isOn: boolean) {
		let text = "NuThoughts is inactive";
		if (isOn) {
			text = "NuThoughts is active";
		}

		this.serverStatusBarEl.setText(text);
	}
}
