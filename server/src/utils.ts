import * as net from "net";

export const setupParentProcessConnection = (port: string | number) => {
	const client = net.createConnection(Number(port), "localhost", () => {
		// console.log("Connected to server");
	});

	client.on("end", () => {
		console.log("Server disconnected, exiting...");
		process.exit();
	});
};
