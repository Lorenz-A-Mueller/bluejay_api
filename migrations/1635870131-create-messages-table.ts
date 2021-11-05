export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating messages table...');
  await sql`

CREATE TABLE messages(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
ticket_id integer REFERENCES tickets (id) ON DELETE CASCADE NOT NULL,
created timestamp NOT NULL,
content varchar(1000) NOT NULL,
responder_id integer REFERENCES employees (id)
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping tickets table');
  await sql`

	DROP TABLE messages;

	`;
}
