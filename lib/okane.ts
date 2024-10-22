import type { Driver } from "../drivers/base";
import type { StarlingDriver } from "../drivers/starling";
import type { Store } from "./store/base";

export type OkaneOpts = {
	store: Store;
	driver: StarlingDriver;
	vat_rate: number;
	corporation_tax_rate: number;
};

interface ImportOpt {
	start_date: Date;
	end_date: Date;
	category?: string;
}

export type Summary = {
	balance: number;
	total_balance: number;
	revenue: number;
	vat_owed: number;
	corp_tax_owed: number;
	wages: number;
	expenses: number;
	profit: number;
	dividends: number;
	available_dividends: number;
};

export class Okane {
	private readonly store;
	private readonly driver: Driver;
	private readonly vat_rate: number = 0.2;
	private readonly corporation_tax_rate: number = 0.2;

	constructor(opts: OkaneOpts) {
		this.store = opts.store;
		this.driver = opts.driver;
		this.vat_rate = opts.vat_rate;
		this.corporation_tax_rate = opts.corporation_tax_rate;
	}

	// Import data from Bank
	public async import(opts: ImportOpt) {
		const balance = await this.driver.balance();
		const feed = await this.driver.transactions({
			start_date: opts.start_date,
			end_date: opts.end_date,
			// category: opt.category,
		});

		this.store.insert_balance(balance);
		this.store.insert_transactions(feed);
	}

	public async ledger() {
		return this.store.ledger(this.driver.source);
	}
	
	public async summary2() {
		return this.store.summary(this.driver.source);
	}

	public async summary(): Promise<Summary> {
		// const balance = await this.balance();
		const balance = await this.store.balance(this.driver.source);
		const feed = await this.store.ledger(this.driver.source);
        
		// console.log(feed.slice(0, 2));

		console.log(new Set(feed.flatMap(row => row.categories)))

		const wages = feed.filter((t) => t.categories.includes("DIRECTORS_WAGES")).reduce((acc, t) => acc + t.amount, 0);
		const dividends = feed.filter((t) => t.categories.includes("DIVIDENDS")).reduce((acc, t) => acc + t.amount, 0);
		const expenses = feed
			.filter((t) => t.direction === "OUT" && !['DIRECTORS_WAGES', 'DIVIDENDS', 'VAT', 'CORPORATION_TAX'].some((cat) => t.categories.includes(cat)))
			.reduce((acc, t) => acc + t.amount, 0);
		const revenue = feed.filter((t) => t.direction === "IN").reduce((acc, t) => acc + t.amount, 0);
		const profit = revenue - (expenses + wages);
		const corp_tax = profit * this.corporation_tax_rate;
		const vat = revenue * this.vat_rate;

		const available_dividends = profit - (corp_tax + vat + dividends);

		return {
			balance: balance?.amount ?? 0,
			total_balance: balance?.total_amount ?? 0,
			wages: wages,
            expenses,
			revenue: revenue,
			corp_tax_owed: corp_tax,
			vat_owed: vat,
			profit: profit,
			dividends: dividends,
			available_dividends: available_dividends,
		};
	}
}
