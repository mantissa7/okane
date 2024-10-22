export function currency(pennies: number) {
	return new Intl.NumberFormat(navigator.language, {
		style: "currency",
		currencyDisplay: "narrowSymbol",
		currency: "GBP",
	}).format(pennies / 100);
}

export function pct(a: number, b: number) {
	return ((a / b) * 100).toFixed(0);
}