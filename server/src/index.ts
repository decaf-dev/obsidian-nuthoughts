import * as Bun from "bun";
import * as URL from "url";

import { setupParentProcessConnection } from "./utils";
import { handlePostThought } from "./route/thought";

const serverPort = process.argv[2];
const heartbeatPort = process.argv[3];
const commonName = process.argv[4];
const privateKey = process.argv[5];
const certificate = process.argv[6];
const savePath = process.argv[7];

if (!serverPort) {
	console.log("Server port not specified");
	process.exit(1);
}

if (!heartbeatPort) {
	console.log("Heartbeat port not specified");
	process.exit(1);
}

if (!commonName) {
	console.log("Common name not specified");
	process.exit(1);
}

if (!privateKey) {
	console.log("Private key not specified");
	process.exit(1);
}

if (!certificate) {
	console.log("Certificate not specified");
	process.exit(1);
}

if (!savePath) {
	console.error("Save path not specified");
	process.exit(1);
}

setupParentProcessConnection(heartbeatPort);

Bun.serve({
	fetch: async (request) => {
		const { method, body, url } = request;

		const parsedUrl = URL.parse(url);
		const pathName = parsedUrl.pathname;

		if (method === "POST") {
			switch (pathName) {
				case "/thought":
					await handlePostThought(body, savePath);
					break;
				default:
					return new Response(`Pathname not found: ${pathName}`, {
						status: 404,
					});
			}
			return new Response("", {
				status: 201,
			});
		}
		return new Response("NuThoughts is running!");
	},
	tls: {
		key: privateKey,
		cert: certificate,
	},
	port: Number(serverPort),
	error: (err) => {
		return new Response(err.stack, {
			status: 500,
		});
	},
});

console.log(
	`NuThoughts server listening at: https://${commonName}:${serverPort}`
);
