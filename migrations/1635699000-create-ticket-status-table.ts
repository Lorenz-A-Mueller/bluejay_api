export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating ticket_status table...');
  await sql`

CREATE TABLE ticket_status(
id integer PRIMARY KEY NOT NULL,
status_name varchar(10) NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping ticket_status table');
  await sql`

	DROP TABLE ticket_status;

	`;
}
