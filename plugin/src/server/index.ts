import express, { Response } from "express";
import https from "https";
import { App } from "obsidian";
import { handlePostThought } from "./routes/post-thought";
import { NuThoughtsSettings } from "../types";

export default class Server {
	server: https.Server | null = null;

	async start(obsidianApp: App, settings: NuThoughtsSettings, domain: string, port: number, tlsCertificate: string, tlsPrivateKey: string) {
		try {
			const options: https.ServerOptions = {
				cert: tlsCertificate,
				key: tlsPrivateKey
			}

			const app = express();
			app.use(express.json());

			app.get("/", (_, res: Response) => {
				res.send("NuThoughts is running");
			});
			app.post("/thought", async (req, res, next) => handlePostThought(req, res, next, obsidianApp, settings));

			this.server = https.createServer(options, app).listen(port);

			console.log(`NuThoughts listening at: https://${domain}:${port}`);
			return true;
		} catch (err) {
			console.error("Error starting Nuthoughts server: ", err);
			return false;
		}
	}

	close() {
		if (this.server) {
			this.server.close();
			this.server = null;
		}
	}
}
