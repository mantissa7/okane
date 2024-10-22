import type { Database } from "bun:sqlite";
import type { Balance, LedgerRow, Store } from "./base";
// import db from "../data/okane.sqlite" with { "type": "sqlite" };

export class SQLiteStore implements Store {
    private readonly db: Database;

    constructor(db: Database) {
        this.db = db;
    }

	public async ledger(source: string): Promise<LedgerRow[]> {
		const query = this.db.query("SELECT * FROM ledger");
		return (query.iterate().map(row => ({
            ...row,
            categories: JSON.parse(row.categories)
        })) ?? []) as LedgerRow[];
	}
	
    public async balance(source: string): Promise<Balance | null> {
		const query = this.db.query(`
            SELECT      source,
                        amount,
                        total_amount
            FROM        balance
            WHERE       source = :source
            ORDER BY    created DESC
            LIMIT       1
        `);
		
        const ret = query.get({
			source,
		}) as Balance | null;
        
        return ret;
	}

	public async insert_balance(balance: Balance): Promise<void> {
		const insert = this.db.prepare(`
            insert into balance
            (source, amount, total_amount, created)
            values
            (:source, :amount, :total_amount, datetime())
        `);

		insert.run({
			source: balance.source,
			amount: balance.amount,
			total_amount: balance.total_amount,
		});
	}

	public async insert_transactions(txns: LedgerRow[]): Promise<void> {
		const insert = this.db.prepare(`
            INSERT INTO ledger 
            (
                source,
                direction,
                amount,
                status,
                categories,
                transaction_time,
                raw,
                created
            )
            VALUES
            (
                :source,
                :direction,
                :amount,
                :status,
                json(:categories),
                :transaction_time,
                json(:raw),
                datetime()
            )
            ON CONFLICT DO NOTHING
        `);

		const insertTxn = this.db.transaction((rows) => {
			for (const row of rows) {
				insert.run({
                    ...row,
                    categories: JSON.stringify(row.categories),
                });
			}
			return rows.length;
		});

		const count = insertTxn(txns);

		console.log(`stored [${count}] transactions`);
	}
}
