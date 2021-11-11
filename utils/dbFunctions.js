require('dotenv').config();
const postgres = require('postgres');
const setPostgresDefaultsOnHeroku = require('../setPostgresDefaultsOnHeroku.js');

setPostgresDefaultsOnHeroku();

function connectOneTimeToDatabase() {
  let sql;

  if (process.env.NODE_ENV === 'production') {
    // Heroku needs SSL connections but
    // has an "unauthorized" certificate
    // https://devcenter.heroku.com/changelog-items/852
    sql = postgres({ ssl: { rejectUnauthorized: false } });
  } else {
    // When we're in development, make sure that we connect only
    // once to the database
    if (!globalThis.postgresSqlClient) {
      globalThis.postgresSqlClient = postgres();
    }
    sql = globalThis.postgresSqlClient;
  }

  return sql;
}

const sql = connectOneTimeToDatabase();

const { createRandomTicketNumber } = require('./createRandomTicketNumber');

exports.getCustomers = async () => {
  const customers = await sql`
  SELECT
  id, number, first_name, last_name, email, phone_number, dob, status
  FROM customers;
  `;
  return customers;
};

exports.getCustomerById = async (id) => {
  const customer = await sql`
  SELECT
  number, first_name, last_name, email, phone_number, dob, status
  FROM customers
  WHERE id=${id};
  `;
  return customer[0];
};

exports.getCustomerByNumberWithHashedPassword = async (number) => {
  const customer = await sql`
  SELECT * FROM customers
  WHERE number=${number};
  `;
  return customer[0];
};

exports.createCustomer = async (newCustomer) => {
  const customer = await sql`
  INSERT INTO customers
  (first_name, last_name, email, password, phone_number, dob, status)
  VALUES
  (${newCustomer.first_name}, ${newCustomer.last_name}, ${newCustomer.email}, ${newCustomer.password}, ${newCustomer.phone_number}, ${newCustomer.dob}, ${newCustomer.status})
  RETURNING
  (first_name, last_name, email, phone_number, dob, status)
  `;
  return customer[0];
};

exports.getEmployees = async () => {
  const employees = await sql`
  SELECT
  *
  FROM employees;
  `;
  return employees;
};

exports.getEmployeeById = async (id) => {
  const employee = await sql`
  SELECT
  id, number, first_name, last_name, email, dob, role
  FROM employees
  WHERE id=${id};
  `;
  return employee[0];
};

exports.getEmployeeByNumberWithHashedPassword = async (number) => {
  const employee = await sql`
  SELECT * FROM employees
  WHERE number=${number};
  `;
  return employee[0];
};

exports.createCustomerSession = async (token, id) => {
  const session = await sql`
  INSERT INTO customer_sessions
  (token, customer_id)
  VALUES
  (${token}, ${id})
  RETURNING *
  `;
  return session[0];
};

exports.createEmployeeSession = async (token, id) => {
  const session = await sql`
  INSERT INTO employee_sessions
  (token, employee_id)
  VALUES
  (${token}, ${id})
  RETURNING *
  `;
  return session[0];
};

exports.deleteExpiredCustomerSessions = async () => {
  const sessions = await sql`
  DELETE FROM customer_sessions
  WHERE
  expiry_timestamp < NOW()
  RETURNING *
  `;
  return sessions;
};

exports.getValidCustomerSessionByToken = async (token) => {
  console.log('token in fn: ', token);
  if (!token) return undefined;
  const customerSession = await sql`
  SELECT * FROM customer_sessions
  WHERE
  token = ${token} AND
  expiry_timestamp > NOW()
  `;
  console.log('customerSession:', customerSession[0]);
  return customerSession[0];
};

exports.getValidEmployeeSessionByToken = async (token) => {
  console.log('token in fn: ', token);
  if (!token) return undefined;
  const employeeSession = await sql`
  SELECT * FROM employee_sessions
  WHERE
  token = ${token} AND
  expiry_timestamp > NOW()
  `;
  console.log('employeeSession:', employeeSession);
  return employeeSession[0];
};

exports.deleteExpiredEmployeeSessions = async () => {
  const sessions = await sql`
  DELETE FROM employee_sessions
  WHERE
  expiry_timestamp < NOW()
  RETURNING *
  `;
  return sessions;
};

exports.deleteEmployeeSession = async (token) => {
  const session = await sql`
  DELETE FROM employee_sessions
  WHERE
  token = ${token}
  RETURNING *
  `;
  return session[0];
};

exports.deleteCustomerSessionByToken = async (token) => {
  const session = await sql`
  DELETE from customer_sessions
  WHERE token = ${token}
  RETURNING *;
  `;
  return session[0];
};

exports.getAllTickets = async () => {
  const tickets = await sql`
  SELECT * FROM tickets;
  `;
  return tickets;
};

exports.getTicketsByTimeFrame = async (startTime, endTime) => {
  const tickets = await sql`
  SELECT * FROM tickets
  WHERE
  created BETWEEN ${startTime} AND ${endTime}
  `;
  return tickets;
};

exports.getTicketById = async (id) => {
  const ticket = await sql`
  SELECT * FROM tickets
  WHERE
  id=${id}
  `;
  return ticket[0];
};

exports.getUnclosedTicketByCustomerId = async (id) => {
  const ticket = await sql`
  SELECT * FROM tickets
  WHERE
  customer_id=${id}
  AND
  status != 3
  `;
  return ticket[0];
};

exports.createTicket = async (customer, category, title) => {
  const ticket = await sql`
  INSERT INTO tickets
  (ticket_number, status, last_response, customer_id, category, priority, created, assignee_id, title)
VALUES
  (${createRandomTicketNumber()}, 1, current_timestamp, ${customer}, ${category}, 'normal', current_timestamp, NULL, ${title})
  RETURNING *
  `;
  return ticket[0];
};

exports.deleteTicketById = async (id) => {
  const ticket = await sql`
  DELETE FROM tickets
  WHERE
  id = ${id}
  RETURNING *;
  `;
  return ticket[0];
};

exports.changeTicketStatusByIdAndStatusId = async (id, statusId) => {
  const ticket = await sql`
  UPDATE tickets
  SET status = ${statusId}
  WHERE id = ${id}
  RETURNING *;

  `;
  return ticket[0];
};

exports.changeTicketPriorityByIdAndPriorityId = async (id, priorityId) => {
  const ticket = await sql`
  UPDATE tickets
  SET priority = ${priorityId}
  WHERE id = ${id}
  RETURNING *;
  `;
  return ticket[0];
};

exports.changeTicketAssigneeByIdAndEmployeeId = async (id, employeeId) => {
  console.log('id', id);
  console.log('employeeId', employeeId);
  const ticket = await sql`
  UPDATE tickets
  SET assignee_id = ${employeeId}
  WHERE id = ${id}
  RETURNING *;
  `;
  return ticket[0];
};

exports.getMessageById = async (id) => {
  const message = await sql`
  SELECT * FROM messages
  WHERE
  id = ${id}
  ;`;
  return message[0];
};

exports.createMessage = async (ticketId, messageContent) => {
  const message = await sql`
  INSERT INTO messages
  (ticket_id, created, content, responder_id)
  VALUES
  (${ticketId}, current_timestamp, ${messageContent}, NULL)
  RETURNING *
  `;
  return message[0];
};

exports.createMessageWithResponderId = async (
  ticketId,
  messageContent,
  responderId,
) => {
  const message = await sql`
  INSERT INTO messages
  (ticket_id, created, content, responder_id)
  VALUES
  (${ticketId}, current_timestamp, ${messageContent}, ${responderId})
  RETURNING *
  `;
  return message[0];
};

exports.getMessages = async (ticketId) => {
  const messages = await sql`
  SELECT * FROM messages
  WHERE
  ticket_id = ${ticketId};
  `;
  return messages;
};

exports.getStatus = async (id) => {
  const status = await sql`
  SELECT * FROM ticket_status
  WHERE
  id = ${id};
  `;
  return status[0];
};

exports.getStatuses = async () => {
  const statuses = await sql`
  SELECT
 *
  FROM ticket_status
  `;
  return statuses;
};

exports.getCategory = async (id) => {
  const category = await sql`
  SELECT * FROM ticket_categories
  WHERE
  id = ${id};
  `;
  return category[0];
};

exports.getCategories = async () => {
  const categories = await sql`
  SELECT
 *
  FROM ticket_categories
  `;
  return categories;
};

exports.getPriority = async (id) => {
  const priority = await sql`
  SELECT * FROM ticket_priorities
  WHERE
  id = ${id};
  `;
  return priority[0];
};

exports.getPriorities = async () => {
  const priorities = await sql`
  SELECT
 *
  FROM ticket_priorities
  `;
  return priorities;
};

exports.getRoles = async () => {
  const roles = await sql`
  SELECT
 *
  FROM roles
  `;
  return roles;
};

exports.getRole = async (id) => {
  const role = await sql`
  SELECT * FROM roles
  WHERE
  id = ${id};
  `;
  return role[0];
};
