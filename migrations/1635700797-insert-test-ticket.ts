export async function up(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Inserting test ticket into tickets table...');
  await sql`

INSERT INTO tickets
(ticket_number, status, last_response, customer_id, category, priority, created, assignee_id, title)
VALUES
('#111111111', 1, '2021-10-31 18:22:00', 1, 2, 'urgent', '2021-10-31 18:22:00', 1, 'This is a complaint'),
('#111111111', 1, '2021-10-31 18:22:00', 1, 2, 'urgent', '2021-10-31 18:22:00', 2, 'b'),
('#111111111', 1, '2021-10-31 18:22:00', 1, 2, 'urgent', '2021-10-31 18:22:00', 2, 'c'),
('#111111111', 2, '2021-10-31 18:22:00', 1, 4, 'urgent', '2021-10-31 18:22:00', 3, 'd'),
('#111111111', 2, '2021-10-31 18:22:00', 1, 4, 'urgent', '2021-10-31 18:22:00', 3, 'e'),
('#111111111', 2, '2021-10-31 18:22:00', 1, 3, 'urgent', '2021-10-31 18:22:00', 3, 'f'),
('#111111111', 3, '2021-10-31 18:22:00', 1, 1, 'urgent', '2021-10-31 18:22:00', 5, 'g')
	`;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting test ticket from tickets table');
  await sql`

	DELETE FROM tickets;

	`;
}
