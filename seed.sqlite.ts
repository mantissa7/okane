import { Database } from "bun:sqlite";

/* * * * * * * * **
*    seed sqlite  *
* * * * * * * * * */ 


const db = new Database("data/okane.sqlite", { create: true, });

db.exec(`
    drop table if exists balance;
    drop table if exists ledger;

	create table balance (
        id int primary key,
        source text not null,
        amount int not null,
        total_amount int not null,

        created text, -- isodate
        deleted text -- isodate
    );

    create table ledger (
        id int primary key,
        source text not null,
        direction text not null,
        amount int not null,
        status text not null,
        categories text, -- json array
        transaction_time text not null, -- isodate
        raw text, -- json

        created text, -- isodate
        deleted text, -- isodate

        UNIQUE(source, direction, amount, status, transaction_time)
    );
`);

