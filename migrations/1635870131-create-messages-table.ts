export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating messages table...');
  await sql`

CREATE TABLE messages(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
customer_id integer REFERENCES customers (id),
created timestamp NOT NULL,
content varchar(1000) NOT NULL
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
