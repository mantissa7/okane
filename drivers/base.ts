import type { Balance, LedgerRow } from "../lib/store/base";


export interface Driver {
    source: string;

    balance(): Promise<Balance>
    transactions(opts: any): Promise<LedgerRow[]>;

    // import(opts: any): Promise<ImportRet>
}