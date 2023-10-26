import * as Bun from "bun";
import { generateSelfSignedCert, setupHeartbeatSocket } from "./utils";

const DEFAULT_SERVER_PORT = 8123;
const DEFAULT_HEARTBEAT_PORT = 8124;

const serverPort = process.argv[2] || DEFAULT_SERVER_PORT;
const heartbeatPort = process.argv[3] || DEFAULT_HEARTBEAT_PORT;
const commonName = process.argv[4] || "localhost";

const tls = generateSelfSignedCert(commonName);

Bun.serve({
	fetch: () => {
		return new Response("Welcome to NuThoughts.");
	},
	tls: {
		key: tls.private,
		cert: tls.cert,
	},
	port: Number(serverPort),
	// error: (err) => {
	// 	console.error(err);
	// },
});

setupHeartbeatSocket(heartbeatPort);

console.log(
	`NuThoughts server listening at: https://${commonName}:${serverPort}`
);
