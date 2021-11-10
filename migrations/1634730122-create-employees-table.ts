export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating employees table...');
  await sql`

CREATE TABLE employees(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
number varchar(10) NOT NULL,
first_name varchar(30) NOT NULL,
last_name varchar(30) NOT NULL,
email varchar(30) NOT NULL,
password_hashed varchar(60) NOT NULL,
dob date NOT NULL,
role integer REFERENCES roles(id)
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
