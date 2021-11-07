export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Inserting categories into ticket_categories table...');
  await sql`

INSERT INTO ticket_categories
(id, category_name)
VALUES
(1, 'Flight infos'),
(2, 'Change flight'),
(3, 'Suggestion'),
(4, 'Complaint'),
(5, 'Other')
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting categories from ticket_categories table');
  await sql`

	DELETE FROM ticket_categories;

	`;
}
