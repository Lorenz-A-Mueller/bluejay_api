export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Inserting roles into roles table...');
  await sql`

INSERT INTO roles
(id, role_name)
VALUES
(1, 'admin'),
(2, 'user')
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting roles from roles table');
  await sql`

	DELETE FROM roles
	`;
}
