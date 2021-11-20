const { gql } = require('apollo-server-express');

exports.typeDefs = gql`
  scalar Date
  scalar Timestamp
  input customerSearch {
    id: ID
    emailAndPassword: [String]
  }
  input employeeSearch {
    id: ID
    number: [String]
  }
  input ticketSearch {
    id: ID
    customer_id: ID
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
    ticket(search: ticketSearch!): Ticket
    message(id: ID): Message
    messages(ticket_id: ID): [Message]
    status(id: ID): Status
    statuses: [Status]
    categories: [Category]
    category(id: ID): Category
    ticketsByTimeFrame(startTime: String, endTime: String): [Ticket]
    priority(id: ID): Priority
    priorities: [Priority]
    roles: [Role]
    role(id: ID): Role
  }
  type Mutation {
    createCustomer(
      first_name: String!
      last_name: String!
      email: String!
      password: String!
      phone_number: String!
      dob: Date!
    ): Customer

    createNewTicket(customer_id: ID!, category: ID!, title: String!): Ticket
    createNewMessage(ticket_id: ID!, content: String!): Message
    createNewMessageWithResponderId(
      ticket_id: ID!
      content: String!
      responder_id: ID!
    ): Message

    deleteEmployeeSession: EmployeeSession
    deleteTicket(id: ID!): Ticket
    changeTicketStatus(id: ID!, status: ID!): Ticket
    changeTicketPriority(id: ID!, priority: ID!): Ticket
    changeTicketAssignee(id: ID!, assignee_id: ID!): Ticket
    changeTicketLastResponse(id: ID!): Ticket
    deleteCustomerSession: CustomerSession
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
    role: ID
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
    status: ID
    last_response: String #????
    customer_id: ID
    category: ID
    priority: ID
    created: String #???
    assignee_id: ID
    title: String
  }
  type Message {
    id: ID
    ticket_id: ID
    created: String
    content: String
    responder_id: ID
  }
  type Status {
    id: ID!
    status_name: String!
  }
  type Category {
    id: ID!
    category_name: String!
  }
  type Priority {
    id: ID!
    priority_name: String!
  }
  type Role {
    id: ID!
    role_name: String!
  }
`;
