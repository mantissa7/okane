import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { plugin } from "bun";

await plugin({
	name: "svelte loader",
	async setup(build) {
		const { compile, preprocess } = await import("svelte/compiler");

		// when a .svelte file is imported...
		build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
			// read and compile it with the Svelte compiler
			const file = await Bun.file(path).text();

			const pre = await preprocess(file, vitePreprocess());
            
			console.log(pre)
			// console.log(compile(pre.code, {
			// 	filename: path,
			// 	// generate: "ssr",
			// 	customElement: true,
			// }))

			let html = "";
			let css = "";
			let js = "";

			const tpl = new HTMLRewriter()
			.on("script", {
				element(el) {
					// if (el.tagName === "script") {
					// 	js = el.
					// }
					// for (const [attr, val] of el.attributes) {
					// 	el.removeAttribute(attr);
					// }
					// return el;
				},
			})
			.transform(pre.code);
			
			const contents = compile(pre.code, {
				filename: path,
				generate: "ssr",
			}).js.code;

			// and return the compiled source code as "js"
			return {
				contents,
				loader: "js",
			};
		});
	},
});
