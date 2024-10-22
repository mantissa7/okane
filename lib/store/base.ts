export type LedgerRow = {
	source: string;
	direction: string;
	amount: number;
    status: string;
	categories: string[];
	transaction_time: string;
	raw: string,
};

export type Balance = {
	source: string;
	amount: number;
	total_amount: number;
};

export interface Store {
	ledger(source: string): Promise<LedgerRow[]>;

	balance(source: string): Promise<Balance | null>;

	insert_balance(balance: Balance): Promise<void>;

	insert_transactions(txns: LedgerRow[]): Promise<void>;
}
