const { gql } = require('apollo-server-express');

exports.typeDefs = gql`
  scalar Date
  scalar Timestamp
  input customerSearch {
    id: ID
    number: [String]
  }
  input employeeSearch {
    id: ID
    number: [String]
  }
  type Query {
    customers: [Customer]
    customer(search: customerSearch!): Customer
    employees: [Employee]
    employee(search: employeeSearch!): Employee
    customerSession: CustomerSession
    employeeSession: EmployeeSession
    deleteAllExpiredCustomerSessions: [CustomerSession]
    deleteAllExpiredEmployeeSessions: [EmployeeSession]
    tickets: [Ticket]
    ticket(id: ID): Ticket
    message(id: ID): Message
  }
  type Mutation {
    createCustomer(
      number: String!
      first_name: String!
      last_name: String!
      email: String!
      password_hashed: String!
      phone_number: String!
      dob: Date!
      status: String!
    ): Customer

    createNewTicket(
      customer_id: ID
      category: String
      title: String
      messages: [Int]
    ): Ticket
    createNewMessage(customer_id: ID!, content: String!): Message
  }
  type Customer {
    id: ID
    number: String
    first_name: String
    last_name: String
    email: String
    password_hashed: String
    phone_number: String
    dob: Date
    status: String
  }
  type Employee {
    id: ID
    number: String
    first_name: String
    last_name: String
    email: String
    password_hashed: String
    dob: Date
    admin: Boolean
  }
  type CustomerSession {
    id: ID
    token: String
    expiry_timestamp: Timestamp
    customer_id: ID
  }
  type EmployeeSession {
    id: ID
    token: String
    expiry_timestamp: Timestamp
    employee_id: ID
  }
  type Ticket {
    id: ID
    ticket_number: String
    status: String
    last_response: String #????
    customer_id: ID
    category: String
    priority: String
    created: String #???
    assignee_id: ID
    title: String
    messages: [Int]
  }
  type Message {
    id: ID
    customer_id: ID
    created: String
    content: String
  }
`;
