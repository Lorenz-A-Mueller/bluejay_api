export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating tickets table...');
  await sql`

CREATE TABLE tickets(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
ticket_number varchar(10) NOT NULL,
status varchar(10) NOT NULL,
last_response timestamp NOT NULL,
customer_id integer REFERENCES customers (id),
category varchar(20) NOT NULL,
priority varchar(20) NOT NULL,
created timestamp NOT NULL,
assignee_id integer REFERENCES employees (id),
title varchar (50) NOT NULL,
messages integer[] NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping tickets table');
  await sql`

	DROP TABLE tickets;

	`;
}
