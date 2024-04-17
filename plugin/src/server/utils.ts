import { App } from "obsidian";
import * as path from "path";

const CA_CERT_FILE_NAME = "caCert.pem";
const CA_KEY_FILE_NAME = "caPrivateKey.pem";

export const getTLSPath = (app: App) => {
	const vaultPath = getVaultPath(app);
	const configDir = getConfigDir(app);

	const tlsPath = path.join(vaultPath, configDir, "nuthoughts-tls");
	return tlsPath;
};

export const getPluginPath = (app: App, includeVaultPath: boolean) => {
	const vaultPath = getVaultPath(app);
	const configDir = getConfigDir(app);

	const pluginPath = path.join(
		includeVaultPath ? vaultPath : "",
		configDir,
		"plugins",
		"obsidian-nuthoughts"
	);
	return pluginPath;
};

export const getVaultPath = (app: App) => {
	const vaultPath = (app.vault.adapter as any).basePath;
	return vaultPath;
};

export const getConfigDir = (app: App) => {
	const configDir = app.vault.configDir;
	return configDir;
};

export const getCAKeyPath = (app: App, includeVaultPath: boolean) => {
	const pluginPath = getPluginPath(app, includeVaultPath);
	const caKeyPath = path.join(pluginPath, CA_KEY_FILE_NAME);
	return caKeyPath;
};

export const getCACertPath = (app: App, includeValuePath: boolean) => {
	const pluginPath = getPluginPath(app, includeValuePath);
	const caCertPath = path.join(pluginPath, CA_CERT_FILE_NAME);
	return caCertPath;
};
