import Starling, { type FeedItem } from "starling-developer-sdk";
import type { Driver } from "./base";
import type { Balance, LedgerRow } from "../lib/store/base";

/* * * * * * * * * * * * * * * * **
 *   starling transaction driver  *
 * * * * * * * * * * * * * * * * **/

interface StarlingDriverOptions {
	api_key: string;
	// account_id: string;
}

interface TransactionsOpt {
	start_date: Date;
	end_date: Date;
	category?: string;
}

interface ImportOpts {
	start_date: Date;
	end_date: Date;
	category?: string;
}

export class StarlingDriver implements Driver {
	public readonly source: string = 'STARLING';
	
	private readonly api_key: string;
	private readonly client: Starling;

	private _account: any;

	constructor(opts: StarlingDriverOptions) {
		this.api_key = opts.api_key;
		

		this.client = new Starling({
			// apiUrl: 'https://api-sandbox.starlingbank.com',
			accessToken: opts.api_key,
		});
	}

	private async api(path: string) {
		const resp = await fetch(`https://api.starlingbank.com/api/v2${path}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${this.api_key}`,
			},
		});

		const body = await resp.json();

		return body;
	}

	public async account() {
		if (this._account) {
			return this._account;
		}

		const {
			data: {
				accounts: [account],
			},
		} = await this.client.account.getAccounts();

		this._account = account;
		return account;
	}

	public async balance(): Promise<Balance> {
		const account = await this.account();

		const { data: balance } = await this.client.account.getAccountBalance({
			accountUid: account.accountUid,
		});

		return {
			source: this.source,
			amount: balance.effectiveBalance.minorUnits,
			total_amount: balance.totalEffectiveBalance.minorUnits,
		};
	}

	public transactions = async (options: TransactionsOpt): Promise<LedgerRow[]> => {
		const account = await this.account();
		const category = options.category ?? account.defaultCategory;

		const { feedItems: feed }: { feedItems: FeedItem[] } = await this.api(
			`/feed/account/${account.accountUid}/category/${category}/transactions-between?minTransactionTimestamp=${options.start_date.toISOString()}&maxTransactionTimestamp=${options.end_date.toISOString()}`,
		);

		return feed.map((row) => ({
			source: this.source,
			direction: row.direction,
			// currency: row.amount.currency,
			amount: row.amount.minorUnits,
			status: row.status,
			categories: [row.spendingCategory],
			transaction_time: row.transactionTime,
			raw: JSON.stringify(row),
		}));
	};

	// public async import(opt: ImportOpts): Promise<ImportRet> {
	// 	const balance = await this.balance();
	// 	const feed = await this.transactions({
	// 		start_date: opt.start_date,
	// 		end_date: opt.end_date,
	// 		category: opt.category,
	// 	});

	// 	const wages = feed.filter((t) => t.spendingCategory === "DIRECTORS_WAGES").reduce((acc, t) => acc + t.amount.minorUnits, 0);
	// 	const dividends = feed.filter((t) => t.spendingCategory === "DIVIDENDS").reduce((acc, t) => acc + t.amount.minorUnits, 0);
	// 	const expenses = feed
	// 		.filter((t) => t.direction === "OUT" && !["DIVIDENDS", "DIRECTORS_WAGES"].includes(t.spendingCategory))
	// 		.reduce((acc, t) => acc + t.amount.minorUnits, 0);
	// 	const revenue = feed.filter((t) => t.direction === "IN").reduce((acc, t) => acc + t.amount.minorUnits, 0);
	// 	const profit = revenue - (expenses + wages);
	// 	const corp_tax = profit * this.corporation_tax_rate;
	// 	const vat = revenue * this.vat_rate;

	// 	const available_dividends = profit - (corp_tax + vat + dividends);

	// 	return {
	// 		balance: balance.effectiveBalance.minorUnits,
	// 		total_balance: balance.totalEffectiveBalance.minorUnits,
	// 		wages: wages,
	// 		revenue: revenue,
	// 		corp_tax_owed: corp_tax,
	// 		vat_owed: vat,
	// 		profit: profit,
	// 		dividends: dividends,
	// 		available_dividends: available_dividends,
	// 	};
	// }
}
