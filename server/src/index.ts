import * as Bun from "bun";
import * as URL from "url";

import { generateSelfSignedCert, setupParentProcessConnection } from "./utils";
import { handlePostThought } from "./route/thought";

const serverPort = process.argv[2];
const heartbeatPort = process.argv[3];
const commonName = process.argv[4];
const vaultPath = process.argv[5];

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

if (!vaultPath) {
	console.error("Vault path not specified");
	process.exit(1);
}

const tls = generateSelfSignedCert(commonName);

setupParentProcessConnection(heartbeatPort);

Bun.serve({
	fetch: async (request) => {
		const { method, body, url } = request;

		const parsedUrl = URL.parse(url);
		const pathName = parsedUrl.pathname;

		if (method === "POST") {
			switch (pathName) {
				case "/thought":
					await handlePostThought(body, vaultPath);
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
		key: tls.private,
		cert: tls.cert,
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
