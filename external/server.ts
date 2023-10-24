import * as Bun from "bun";

Bun.serve({
	fetch(req) {
		return new Response("Bun!");
	},
});
