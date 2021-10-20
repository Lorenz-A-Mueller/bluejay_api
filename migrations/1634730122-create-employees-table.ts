export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating employees table...');
  await sql`

CREATE TABLE employees(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
first_name varchar(30) NOT NULL,
last_name varchar(30) NOT NULL,
email varchar(30) NOT NULL,
password varchar(30) NOT NULL,
dob date NOT NULL,
admin boolean NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping employees table');
  await sql`

	DROP TABLE employees;

	`;
}
