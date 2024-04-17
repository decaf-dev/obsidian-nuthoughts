import { NextFunction, Request, Response } from "express";
import { validateFields } from "../validation";
import { Notice, moment } from "obsidian";

import * as path from "path";

import { App } from "obsidian";
import { Thought } from "./types";
import { NuThoughtsSettings } from "../../types";

export const handlePostThought = async (req: Request, res: Response, next: NextFunction, obsidianApp: App, settings: NuThoughtsSettings) => {
	const { creationTime, text } = req.body;

	if (creationTime === undefined) {
		next("Missing field: creationTime");
		return;
	} else if (text === undefined) {
		next("Missing field: text");
		return;
	}


	try {
		validateFields([
			{
				name: "creationTime",
				value: creationTime,
				expectedType: "number",
			},
			{
				name: "text",
				value: text,
				expectedType: "string",
			},
		]);
	} catch (err) {
		next(err);
		return;
	}

	const { saveFolder } = settings;
	const result = await saveThought(obsidianApp, saveFolder, {
		creationTime,
		text,
	});
	if (result === null) {
		next("Error saving thought");
		return;
	}

	res.send(`Thought saved: ${result}`);
}

const saveThought = async (obsidianApp: App, saveFolder: string, thought: Thought) => {
	const { creationTime, text } = thought;

	const fileName = `nuthought-${creationTime}.md`;
	const filePath = path.join(saveFolder, fileName);
	const data = getFrontmatter(creationTime) + "\n" + text;

	try {
		await obsidianApp.vault.create(filePath, data);
		return filePath;
	} catch (err: unknown) {
		console.error(`Error saving thought: ${err}`);
		new Notice(`Error saving thought: ${err}`);
		return null;
	}
};

const getFrontmatter = (creationTime: number) => {
	const dateTime = getDateTime(creationTime);
	const lines: string[] = [];
	lines.push("---");
	lines.push(`creation: ${dateTime}`);
	lines.push("---");
	return lines.join("\n");
}

const getDateTime = (creationTime: number) => {
	const momentDate = moment.unix(creationTime);
	return momentDate.format("YYYY-MM-DDTHH:mm:ss");
}
