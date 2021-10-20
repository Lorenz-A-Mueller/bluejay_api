export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Creating customers table...');
  await sql`

CREATE TABLE customers(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
first_name varchar(30) NOT NULL,
last_name varchar(30) NOT NULL,
email varchar(30) NOT NULL,
password varchar(20) NOT NULL,
phone_number varchar(15) NOT NULL,
dob date NOT NULL,
status varchar(10) NOT NULL
);
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Dropping customers table');
  await sql`

	DROP TABLE customers;

	`;
}
