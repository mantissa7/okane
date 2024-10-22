import { DataTable } from "../components/data-table";
import { currency, pct } from "../lib/fmt";
import type { Okane } from "../lib/okane";

export default async function index(req: Request, okane: Okane) {
	const financialYear = new Date(2024, 5, 1);
	const financialYearEnd = new Date(2025, 5, 1);

	// const { savingsGoals }: { savingsGoals: any[] } = await api(`/account/${uid}/spaces`);

	// const taxSpace = savingsGoals.find((s) => s.savingsGoalUid === Bun.env.starling_tax_space_id).totalSaved.minorUnits;
	// const vatSpace = savingsGoals.find((s) => s.savingsGoalUid === Bun.env.starling_vat_space_id).totalSaved.minorUnits;

	// const data = await okane.summary();
	const data = await okane.summary2();

	const ledger = await okane.ledger();

	const props = {
		financialYear: financialYear.toISOString().split("T")[0],
		financialYearEnd: financialYearEnd.toISOString().split("T")[0],
		balance: currency(data.balance),
		totalBalance: currency(data.total_balance),
		revenue: currency(data.revenue),
		vat_owed: currency(data.vat_owed),
		corp_tax_owed: currency(data.corp_tax_owed),
		wages: currency(data.wages),
		expenses: currency(data.expenses),
		profit: currency(data.profit),
		dividends: currency(data.dividends_taken),
		availableDividends: currency(data.available_dividends),
	};

	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<link
					rel="stylesheet"
					href="/static/main.css"
				/>
				<title>Okane</title>
			</head>

			<body class="dashboard">
				<h1>Okane</h1>
				<form
					action="/api/bank"
					method="POST"
				>
					<input
						type="hidden"
						name="start_date"
						value={props.financialYear}
					/>
					<input
						type="hidden"
						name="end_date"
						value={props.financialYearEnd}
					/>
					<button>Import Feed</button>
				</form>
				<div class="cards">
					<div class="card">
						<h2>Financial Year</h2>
						<h4>{props.financialYear}</h4>
					</div>
					<div class="card">
						<h2>Balance</h2>
						<h4>{props.balance}</h4>
					</div>
					<div class="card">
						<h2>Total Balance</h2>
						<h4>{props.totalBalance}</h4>
					</div>
				</div>
				<div class="cards">
					<div class="card">
						<h2>Wages</h2>
						<h4>{props.wages}</h4>
					</div>
					<div class="card">
						<h2>Expenses</h2>
						<h4>{props.expenses}</h4>
					</div>
					<div class="card">
						<h2>Revenue</h2>
						<h4>{props.revenue}</h4>
					</div>
					<div class="card">
						<h2>Profit</h2>
						<h4>{props.profit}</h4>
					</div>
					<div class="card">
						<h2>VAT Owed</h2>
						<h4>{props.vat_owed}</h4>
					</div>
					<div class="card">
						<h2>Tax Owed</h2>
						<h4>{props.corp_tax_owed}</h4>
					</div>
					<div class="card">
						<h2>Dividends Taken</h2>
						<h4>{props.dividends}</h4>
					</div>
					<div class="card">
						<h2>Dividends Available</h2>
						<h4>{props.availableDividends}</h4>
					</div>
				</div>
				<br />
				<div>
					<DataTable data={ledger}/>
				</div>
				{/* <div class="cards">
					<div class="card">
						<h2>Corp Tax</h2>
						<div
							class="dial"
							style={`--p:${taxSpace / corpTax}`}
						>
							{taxSpace / corpTax}%
						</div>
						<h4>
							{currency(taxSpace)} / {currency(corpTax)}
						</h4>
					</div>
					<div class="card">
						<h2>VAT</h2>
						<div
							class="dial"
							style={`--p:${pct(vatSpace, vat)}`}
						>
							{pct(vatSpace, vat)}%
						</div>
						<h4>
							{currency(vatSpace)} / {currency(vat)}
						</h4>
					</div>
				</div> */}
			</body>
		</html>
	);
}
