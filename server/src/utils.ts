import * as net from "net";
import * as selfsigned from "selfsigned";

export const setupParentProcessConnection = (port: string | number) => {
	const client = net.createConnection(Number(port), "localhost", () => {
		// console.log("Connected to server");
	});

	client.on("end", () => {
		console.log("Server disconnected, exiting...");
		process.exit();
	});
};

export const generateSelfSignedCert = (commonName: string) => {
	const attrs = [{ name: "commonName", value: commonName }];
	const opts: selfsigned.SelfsignedOptions = {
		algorithm: "sha256",
		days: 356,
		extensions: [
			{ name: "keyUsage", digitalSignature: true, keyEncipherment: true },
		],
		keySize: 2048,
		//@ts-expect-error clientCertificate is wrongly typed as undefined
		clientCertificate: true,
		clientCertificateCN: commonName,
	};

	const pems = selfsigned.generate(attrs, opts);

	return {
		private: pems.private,
		cert: pems.cert,
	};
};
