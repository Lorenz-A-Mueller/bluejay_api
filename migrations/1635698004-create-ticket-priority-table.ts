export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating ticket_priorities table...');
  await sql`

CREATE TABLE ticket_priorities(
id integer PRIMARY KEY NOT NULL,
priority_name varchar(20) NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping ticket_priorities table');
  await sql`

	DROP TABLE ticket_categories;

	`;
}
