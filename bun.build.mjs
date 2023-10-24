import builtins from "builtin-modules";

import Bun from "bun";
import chokidar from "chokidar";
import _ from "lodash";
import babel from "@babel/core";
import fs from "fs";

const filePath = "./main.js";
const outputFile = "./main.js";

const prod = process.argv[2] === "production";

if (!prod) {
	const watcher = chokidar.watch("src/", {
		persistent: true,
	});

	watcher
		.on("add", () => throttleBuild())
		.on("change", () => throttleBuild())
		.on("unlink", () => throttleBuild());
} else {
	build();
}

const throttleBuild = _.throttle(build, 1000);

async function build() {
	console.log("rebuilding...");
	await _buildBun();
	//_convertToCommonJS();
}

async function _buildBun() {
	return Bun.build({
		entrypoints: ["./src/main.ts"],
		outdir: ".",
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
		target: "browser",
		sourcemap: !prod,
	});
}

function _convertToCommonJS() {
	const transformed = babel.transformFileSync(filePath, {
		presets: ["@babel/preset-env"],
	});

	fs.writeFileSync(outputFile, transformed.code);
}
