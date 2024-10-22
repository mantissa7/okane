import { PGlite } from "@electric-sql/pglite";

/* * * * * * * * **
*    seed sqlite  *
* * * * * * * * * */ 


const db = new PGlite("./data/okane");

await db.exec(`
    drop table if exists balance;
    drop table if exists ledger;

	create table balance (
        id serial primary key,
        source text not null,
        amount int not null,
        total_amount int not null,

        created timestamptz,
        deleted timestamptz
    );

    create table ledger (
        id serial primary key,
        source text not null,
        direction text not null,
        amount int not null,
        status text not null,
        categories text[], 
        transaction_time timestamptz not null,
        raw jsonb,

        created timestamptz,
        deleted timestamptz,

        UNIQUE(source, direction, amount, status, transaction_time)
    );
`);

