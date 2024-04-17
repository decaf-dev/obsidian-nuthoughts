import { App } from "obsidian";
import * as path from "path";

export const getPluginPath = (app: App, absolutePath = false) => {
	const configDir = app.vault.configDir;

	const pluginPath = path.join(absolutePath ? getVaultPath(app) : "",
		configDir,
		"plugins",
		"obsidian-nuthoughts"
	);
	return pluginPath;
};

export const getCAKeyPath = (app: App) => {
	const CA_KEY_FILE_NAME = "caPrivateKey.pem";

	const pluginPath = getPluginPath(app);
	const caKeyPath = path.join(pluginPath, CA_KEY_FILE_NAME);
	return caKeyPath;
};

export const getCACertPath = (app: App) => {
	const CA_CERT_FILE_NAME = "caCert.pem";

	const pluginPath = getPluginPath(app);
	const caCertPath = path.join(pluginPath, CA_CERT_FILE_NAME);
	return caCertPath;
};

const getVaultPath = (app: App) => {
	const vaultPath = (app.vault.adapter as any).basePath;
	return vaultPath;
};
