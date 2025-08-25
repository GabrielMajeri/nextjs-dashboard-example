CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
	users (
		id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);

CREATE TABLE
	customers (
		id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email VARCHAR(255) NOT NULL UNIQUE,
		image_url VARCHAR(255) NOT NULL
	);

CREATE TABLE
	invoices (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4 () NOT NULL,
		customer_id UUID NOT NULL REFERENCES customers (id),
		amount INTEGER NOT NULL,
		status VARCHAR(255) NOT NULL,
		date DATE NOT NULL
	);

CREATE TABLE
	revenue (
		month VARCHAR(4) NOT NULL UNIQUE,
		revenue INTEGER NOT NULL
	);
