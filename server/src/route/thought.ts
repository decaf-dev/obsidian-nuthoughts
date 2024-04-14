import { Thought } from "../types";
import { validateFields } from "../validation";
import * as path from "path";
import * as fs from "fs";
import * as moment from "moment";

export const handlePostThought = async (
	body: ReadableStream | null,
	vaultPath: string
) => {
	console.log("Handling post thought");
	if (body) {
		const data = (await Bun.readableStreamToJSON(body)) as Thought;
		validateFields([
			{
				name: "creationTime",
				value: data.creationTime,
				expectedType: "number",
			},
			{
				name: "text",
				value: data.text,
				expectedType: "string",
			},
		]);
		await saveThought(data, vaultPath);
	}
};

const saveThought = async (thought: Thought, savePath: string) => {
	const { creationTime, text } = thought;

	const fileName = `nuthought-${creationTime}.md`;
	const filePath = path.join(savePath, fileName);
	const fileData = getFrontmatter(creationTime) + "\n" + text;

	console.log("Saving thought to", filePath);

	try {
		await fs.promises.mkdir(savePath);
	} catch (err: unknown) { }

	await Bun.write(filePath, fileData);
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
