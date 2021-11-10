export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating roles table...');
  await sql`

CREATE TABLE roles(
id integer PRIMARY KEY NOT NULL,
role_name varchar(10) NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping roles table');
  await sql`

	DROP TABLE roles;

	`;
}
