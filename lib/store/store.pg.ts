import type { PGlite } from "@electric-sql/pglite";
import type { Balance, LedgerRow, Store } from "./base";

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

export class PGStore implements Store {
	private readonly db: PGlite;

	constructor(db: PGlite) {
		this.db = db;
	}
    
    public async summary(source: string): Promise<Summary> {
		const ret = await this.db.sql`
            with
            cte_balance AS
            (
                select      amount,
                            total_amount
                from        balance
                where       source = ${source}
                order by    created desc
                limit       1
            ),
            cte_ledger as
            (
                SELECT  SUM(amount) FILTER (WHERE 'DIRECTORS_WAGES' = ANY(categories)) as wages,
                        SUM(amount) FILTER (WHERE 'DIVIDENDS' = ANY(categories)) as dividends_taken,
                        SUM(amount) FILTER (
                            WHERE   direction = 'OUT'
                            AND     status = 'SETTLED'
                            AND NOT ARRAY['DIRECTORS_WAGES', 'DIVIDENDS', 'VAT', 'CORPORATION_TAX'] && categories
                        ) as expenses,
                        SUM(amount) FILTER (WHERE DIRECTION = 'IN') as revenue
                FROM    ledger
                WHERE   source LIKE ${source}
            )
            select  b.amount as balance,
                    b.total_amount as total_balance,
                    l.wages,
                    l.dividends_taken,
                    l.expenses,
                    l.revenue,

                    (l.revenue - l.expenses) as profit,
                    (l.revenue - l.expenses) * 0.2 as corp_tax_owed,
                    l.revenue * 0.16 as vat_owed,
                    (l.revenue - l.expenses) - l.dividends_taken as available_dividends
            from    cte_ledger as l,
                    cte_balance as b
        `;
		return ret.rows[0] as Summary;
	}

	public async ledger(source: string): Promise<LedgerRow[]> {
		const ret = await this.db.sql`
            SELECT  * 
            FROM    ledger
            WHERE   source LIKE ${source}
        `;
		return ret.rows as LedgerRow[];
	}

	public async balance(source: string): Promise<Balance | null> {
		const query = await this.db.query(
			`
            SELECT      source,
                        amount,
                        total_amount
            FROM        balance
            WHERE       source = $1
            ORDER BY    created DESC
            LIMIT       1
            `,
			[source],
		);

		return query.rows[0] as Balance | null;
	}

	public async insert_balance(balance: Balance): Promise<void> {
		await this.db.sql`
            insert into balance
            (source, amount, total_amount, created)
            values
            (${balance.source}, ${balance.amount}, ${balance.total_amount}, now())
        `;
	}

	public async insert_transactions(txns: LedgerRow[]): Promise<void> {
		await this.db.transaction(async (tx) => {
			for (const row of txns) {
				await tx.sql`
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
                        ${row.source},
                        ${row.direction},
                        ${row.amount},
                        ${row.status},
                        ${row.categories},
                        ${row.transaction_time},
                        ${row.raw},
                        now()
                    )
                    ON CONFLICT DO NOTHING
                `;
			}
		});
	}
}
