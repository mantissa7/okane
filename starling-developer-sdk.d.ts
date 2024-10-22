declare module "starling-developer-sdk" {
	export = Starling;

	declare class Starling {
		public account: ClientAccount;

		constructor({ accessToken: string });
	}

	export type ClientAccount = {
		getAccounts(): Promise<{ data }>;
		getAccountBalance({ accountUid: string }): Promise<{ data }>;
	};

	export type FeedItem = {
		feedItemUid: string;
		categoryUid: string;
		amount: { currency: string; minorUnits: number };
		sourceAmount: { currency: string; minorUnits: number };
		direction: "IN" | "OUT";
		updatedAt: string; // ISOString
		transactionTime: string; // ISOString
		settlementTime: string; // ISOString
		source: string;
		status: string;
		transactingApplicationUserUid: string;
		counterPartyType: string;
		counterPartyUid: string;
		counterPartyName: string;
		counterPartySubEntityUid: string;
		reference: string;
		country: string;
		spendingCategory: string;
		hasAttachment: boolean;
		hasReceipt: boolean;
		batchPaymentDetails: null;
	};
}
