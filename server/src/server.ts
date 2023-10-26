import * as Bun from "bun";
import * as net from "net";

const DEFAULT_SERVER_PORT = 8123;
const DEFAULT_HEARTBEAT_PORT = 8124;

const serverPort = process.argv[3] || DEFAULT_SERVER_PORT;
const heartbeatPort = process.argv[4] || DEFAULT_HEARTBEAT_PORT;

function setupHeartbeat() {
	const client = net.createConnection(
		Number(heartbeatPort),
		"localhost",
		() => {
			console.log("Connected to server");
		}
	);

	client.on("end", () => {
		console.log("Server disconnected, exiting...");
		process.exit();
	});
}

Bun.serve({
	fetch() {
		return new Response("Bun!");
	},
	port: Number(serverPort),
});

setupHeartbeat();

console.log("NuThoughts server listening at: http://localhost:8123");
