import Bun from "bun";
import chokidar from "chokidar";
import _ from "lodash";
import babel from "@babel/core";
import fs from "fs";
import path from "path";
import builtins from "builtin-modules";

const MAIN_OUTPUT_PATH = path.join(__dirname, "dist", "main.js");

const prod = process.argv[2] === "production";

if (!prod) {
	const watcher = chokidar.watch(["src"], {
		persistent: true,
	});

	watcher.on("ready", () => {
		console.log("watching for changes...");

		watcher
			.on("add", () => throttleBuild())
			.on("change", () => throttleBuild())
			.on("unlink", () => throttleBuild());
	});
}

build();

const throttleBuild = _.throttle(build, 0);

async function build() {
	console.time("Done");
	//Main file
	const MAIN_ENTRYPOINT = path.join(__dirname, "src", "main.ts");
	await _buildBun(MAIN_ENTRYPOINT);
	_convertToCommonJS(MAIN_OUTPUT_PATH);

	//Manifest file
	await _copyManifestFile();
	await _removeImportMeta();

	console.timeEnd("Done");
}

async function _buildBun(entrypoint) {
	return Bun.build({
		entrypoints: [entrypoint],
		outdir: path.join(__dirname, "dist"),
		external: [
			"obsidian",
			"electron",
			"@codemirror/autocomplete",
			"@codemirror/collab",
			"@codemirror/commands",
			"@codemirror/language",
			"@codemirror/lint",
			"@codemirror/search",
			"@codemirror/state",
			"@codemirror/view",
			"@lezer/common",
			"@lezer/highlight",
			"@lezer/lr",
			...builtins,
		],
		minify: prod,
		target: "node",
	});
}

function _copyManifestFile() {
	fs.copyFileSync(
		path.join(__dirname, "manifest.json"),
		path.join(__dirname, "dist", "manifest.json")
	);
}

function _convertToCommonJS(inputPath) {
	const transformed = babel.transformFileSync(inputPath, {
		presets: ["@babel/preset-env"],
	});
	fs.writeFileSync(inputPath, transformed.code);
}

async function _removeImportMeta() {
	try {
		// Read the file
		const data = await fs.promises.readFile(MAIN_OUTPUT_PATH, "utf8");

		const importMetaRegex =
			/var (\w+) = \(0, _nodeModule\.createRequire\)\(import\.meta\.url\);/g;
		const replacement = `const { createRequire } = require('module');\nvar $1 = createRequire(__filename);`;

		const updatedData = data.replace(importMetaRegex, replacement);

		// Write the updated content back to the file
		await fs.promises.writeFile(MAIN_OUTPUT_PATH, updatedData, "utf8");
	} catch (err) {
		console.error("An error occurred:", err);
	}
}
