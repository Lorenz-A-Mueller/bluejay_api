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
  number, first_name, last_name, email, password_hashed, phone_number, dob, status
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
  number, first_name, last_name, email, dob, admin
  FROM employees;
  `;
  return employees;
};

exports.getEmployeeById = async (id) => {
  const employee = await sql`
  SELECT
  number, first_name, last_name, email, password_hashed, dob, admin
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
  console.log('customerSession:', customerSession);
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

exports.getAllTickets = async () => {
  const tickets = await sql`
  SELECT * FROM tickets;
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

exports.createTicket = async (customer, category, title, messages) => {
  const ticket = await sql`
  INSERT INTO tickets
  (ticket_number, status, last_response, customer_id, category, priority, created, assignee_id, title, messages)
VALUES
  (${createRandomTicketNumber()}, 'NEW', current_timestamp, ${customer}, ${category}, 'normal', current_timestamp, NULL, ${title}, ARRAY[${messages}])
  RETURNING *
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

exports.createMessage = async (customerId, messageContent) => {
  const message = await sql`
  INSERT INTO messages
  (customer_id, created, content)
  VALUES
  (${customerId}, current_timestamp, ${messageContent})
  RETURNING *
  `;
  return message[0];
};
