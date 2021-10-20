export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Inserting customers into customers table...');
  const customer = await sql`

INSERT INTO customers
(first_name, last_name, email, password, phone_number, dob, status)
VALUES
('Lorenz', 'Mueller', 'lorenz.a.mueller@gmail.com', 'MyTestPassword1', '004300000', '1991-12-26', 'premium')
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting customers from customers table');
  await sql`

	DELETE FROM customers;

	`;
}
