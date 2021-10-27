import { hashPassword } from '../utils/auth';

export async function up(
  sql: (arg: TemplateStringsArray, arg2: string) => Promise<string[]>,
) {
  console.log('Inserting customers into customers table...');
  const hashedPassword = await hashPassword('MyTestPassword1');
  await sql`

INSERT INTO customers
(number, first_name, last_name, email, password_hashed, phone_number, dob, status)
VALUES
('0000000001', 'Lorenz', 'Mueller', 'lorenz.a.mueller@gmail.com', ${hashedPassword}, '004300000', '1991-12-26', 'premium')
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
