import type { Okane } from "../../lib/okane";

export const POST = async (req: Request, okane: Okane) => {
	const form = await req.formData();

	if (!form.has("start_date")) {
		return new Response("BAD", {
			status: 302,
			headers: {
				location: "/?import=failed",
			},
		});
	}

	await okane.import({
		start_date: new Date(form.get("start_date")?.toString() ?? ''),
		end_date: new Date(form.get("end_date")?.toString() ?? ''),
	});

	return new Response("OK", {
		status: 302,
		headers: {
			location: "/",
		},
	});
};
