import { render } from "preact-render-to-string";
import { StarlingDriver } from "./drivers/starling";
import { Okane } from "./lib/okane";
import { PGlite } from "@electric-sql/pglite";
import { PGStore } from "./lib/store/store.pg";

// const db = new Database("data/okane.sqlite", { create: false, strict: true });

const driver = new StarlingDriver({
	api_key: Bun.env.starling_token || "",
});

const okane = new Okane({
	store: new PGStore(new PGlite("./data/okane")),
	driver,
	vat_rate: 0.2,
	corporation_tax_rate: 0.2,
});

const router = new Bun.FileSystemRouter({
	style: "nextjs",
	dir: "./routes",
	// origin: "https://mydomain.com",
	fileExtensions: [".tsx", ".ts", ".html"],
});

const PORT = Bun.env.PORT || 13371;

console.info(`Listening on port ${PORT}`);

Bun.serve({
	port: PORT,
	async fetch(request, server) {
		const path = new URL(request.url).pathname;
		const match = router.match(request);

		// Assets dir
		const file = Bun.file(`.${path}`);
		if (path.startsWith("/static/") && (await file.exists())) {
			return new Response(file);
		}

		if (match) {
			const mod = await import(match.filePath);
			const fn = mod[request.method] ?? mod.default;

			const res = await fn(request, okane);

			if (res instanceof Response) {
				return res;
			}

			return new Response(render(res), {
				headers: {
					"content-type": "text/html",
				},
			});
		}

		return new Response("NOT FOUND", {
			status: 404,
			headers: {
				"content-type": "text/html",
			},
		});
	},
});
