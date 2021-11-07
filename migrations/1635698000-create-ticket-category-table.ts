export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating ticket_categories table...');
  await sql`

CREATE TABLE ticket_categories(
id integer PRIMARY KEY NOT NULL,
category_name varchar(20) NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping ticket_categories table');
  await sql`

	DROP TABLE ticket_categories;

	`;
}
