export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Inserting priorities into ticket_priorities table...');
  await sql`

INSERT INTO ticket_priorities
(id, priority_name)
VALUES
(1, 'normal'),
(2, 'urgent')
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting priorities from ticket_priorities table');
  await sql`

	DELETE FROM ticket_priorities

	`;
}
