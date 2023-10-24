import builtins from "builtin-modules";

import Bun from "bun";
import chokidar from "chokidar";
import _ from "lodash";
import babel from "@babel/core";
import fs from "fs";

const prod = process.argv[2] === "production";

if (!prod) {
	const watcher = chokidar.watch("src/", {
		persistent: true,
	});

	watcher.on("ready", () => {
		console.log("watching for changes...");

		watcher
			.on("add", () => throttleBuild())
			.on("change", () => throttleBuild())
			.on("unlink", () => throttleBuild());
	});
} else {
	build();
}

const throttleBuild = _.throttle(build, 0);

async function build() {
	console.log("rebuilding...");
	await _buildBun();
	_convertToCommonJS();
}

async function _buildBun() {
	return Bun.build({
		entrypoints: ["./src/main.ts"],
		outdir: "./dist/",
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

function _convertToCommonJS() {
	const INPUT_PATH = "./dist/main.js";
	const transformed = babel.transformFileSync(INPUT_PATH, {
		presets: ["@babel/preset-env"],
	});

	const OUTPUT_PATH = "./dist/main.js";
	fs.writeFileSync(OUTPUT_PATH, transformed.code);
}
