import { createRandomTicketNumber } from '../utils/createRandomTicketNumber';

const transformTimestampIntoDatetime = (timestamp: string) => {
  const date = new Date(Number.parseInt(timestamp, 10));
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedTime;
};

// create random tickets

const createRandomTickets = (
  numberOfTickets: number,
  startTimestamp: number,
) => {
  const arrayOfRandomTickets = [];

  for (let i = 0; i < numberOfTickets; i++) {
    const zeroOrOne = Math.round(Math.random());
    arrayOfRandomTickets.push({
      randomTicketNumber: createRandomTicketNumber(),
      status: Math.ceil(Math.random() * 3),
      lastResponse: transformTimestampIntoDatetime(Date.now().toString()),
      customerId: 1,
      category: Math.ceil(Math.random() * 5),
      priority: Math.ceil(Math.random() * 2),
      created: transformTimestampIntoDatetime(
        (
          startTimestamp +
          Math.floor(Math.random() * (Date.now() - startTimestamp))
        ).toString(),
      ),
      assigneeId: zeroOrOne ? Math.ceil(Math.random() * 6) : null,
      title: 'This is a test ticket',
    });
  }
  return arrayOfRandomTickets;
};

export async function up(
  sql: (
    arg0: TemplateStringsArray,
    arg1: string,
    arg2: number,
    arg3: string,
    arg4: number,
    arg5: number,
    arg6: number,
    arg7: string,
    arg8: number | null,
    arg9: string,
  ) => Promise<string[]>,
) {
  console.log('Inserting test ticket into tickets table...');
  const randomData = createRandomTickets(1000, 1602517120000);

  // 1633690191000 8.10.2021
  // 1602154191000 8.10.2020
  // 1631098191000 8.9.2021
  // 1636066800000 5.11.2021

  for (const row of randomData) {
    await sql`

INSERT INTO tickets
(ticket_number, status, last_response, customer_id, category, priority, created, assignee_id, title)
VALUES
(${row.randomTicketNumber}, ${row.status}, ${row.lastResponse}, ${row.customerId}, ${row.category}, ${row.priority}, ${row.created}, ${row.assigneeId}, ${row.title})
RETURNING *;
`;
  }

  // ('#111111111', 1, '2021-10-31 18:22:00', 1, 2, 'urgent', '2021-10-31 18:22:00', 1, 'This is a complaint'),
  // ('#111111111', 1, '2021-10-31 18:22:00', 1, 2, 'urgent', '2021-11-01 18:22:00', 2, 'b'),
  // ('#111111111', 1, '2021-10-31 18:22:00', 1, 2, 'urgent', '2021-11-01 18:22:00', 2, 'c'),
  // ('#111111111', 2, '2021-10-31 18:22:00', 1, 4, 'urgent', '2021-11-03 18:22:00', 3, 'd'),
  // ('#111111111', 2, '2021-10-31 18:22:00', 1, 4, 'urgent', '2021-11-03 18:22:00', 3, 'e'),
  // ('#111111111', 2, '2021-10-31 18:22:00', 1, 3, 'urgent', '2021-11-03 18:22:00', 3, 'f'),
  // ('#111111111', 3, '2021-10-31 18:22:00', 1, 1, 'urgent', '2021-11-06 18:22:00', 5, 'g')
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting test ticket from tickets table');
  await sql`

	DELETE FROM tickets;

	`;
}
