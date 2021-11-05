export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Inserting status into ticket_status table...');
  await sql`

INSERT INTO ticket_status
(id, status_name)
VALUES
(1, 'NEW'),
(2, 'ONGOING'),
(3, 'CLOSED')
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting status from ticket_status table');
  await sql`

	DELETE FROM ticket_status;

	`;
}
