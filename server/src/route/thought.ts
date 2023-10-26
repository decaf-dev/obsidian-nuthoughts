import { Thought } from "../types";
import { validateFields } from "../validation";
import * as path from "path";

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

const saveThought = async (thought: Thought, vaultPath: string) => {
	const { creationTime, text } = thought;
	const fileName = `nuthought-${creationTime}.md`;
	const filePath = path.join(vaultPath, fileName);
	console.log("Saving thought to", filePath);
	await Bun.write(filePath, text);
};
