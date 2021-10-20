// const setPostgresDefaultsOnHeroku = require('./setPostgresDefaultsOnHeroku');

const { ApolloServer, gql } = require('apollo-server');

require('dotenv').config();
const postgres = require('postgres');
const sql = postgres();

// Connect only once to the database
// https://github.com/vercel/next.js/issues/7811#issuecomment-715259370
// function connectOneTimeToDatabase() {
//   let sql;

//   if (process.env.NODE_ENV === 'production') {
//     // Heroku needs SSL connections but
//     // has an "unauthorized" certificate
//     // https://devcenter.heroku.com/changelog-items/852
//     sql = postgres({ ssl: { rejectUnauthorized: false } });
//   } else {
//     // When we're in development, make sure that we connect only
//     // once to the database
//     if (!globalThis.postgresSqlClient) {
//       globalThis.postgresSqlClient = postgres();
//     }
//     sql = globalThis.postgresSqlClient;
//   }

//   return sql;
// }

// const sql = connectOneTimeToDatabase();

async function getCustomers() {
  const customers = await sql`
  SELECT * FROM customers;
  `;
  return customers;
}

async function getCustomer(id) {
  const customer = await sql`
  SELECT * FROM customers
  WHERE id=${id};

  `;
  return customer[0];
}

async function createCustomer(newCustomer) {
  const customer = await sql`
  INSERT INTO customers
  (first_name, last_name, email, password, phone_number, dob, status)
  VALUES
  (${newCustomer.first_name}, ${newCustomer.last_name}, ${newCustomer.email}, ${newCustomer.password}, ${newCustomer.phone_number}, ${newCustomer.dob}, ${newCustomer.status})
  RETURNING *
  `;
  return customer[0];
}

async function getEmployees() {
  const employees = await sql`
  SELECT * FROM employees;
  `;
  return employees;
}

async function getEmployee(id) {
  const employee = await sql`
  SELECT * FROM employees
  WHERE id=${id};

  `;
  return employee[0];
}

const typeDefs = gql`
  scalar Date
  type Query {
    customers: [Customer]
    customer(id: ID!): Customer
    employees: [Employee]
    employee(id: ID!): Employee
  }
  type Mutation {
    createCustomer(
      first_name: String!
      last_name: String!
      email: String!
      password: String!
      phone_number: String!
      dob: Date!
      status: String!
    ): Customer
  }
  type Customer {
    id: ID
    first_name: String
    last_name: String
    email: String
    password: String
    phone_number: String
    dob: Date
    status: String
  }
  type Employee {
    id: ID
    first_name: String
    last_name: String
    email: String
    password: String
    dob: Date
    admin: Boolean
  }
`;

const resolvers = {
  Query: {
    customers: () => {
      // return [
      //   {
      //     id: 1,
      //     first_name: 'ich',
      //     last_name: 'du',
      //     email: 'asdf',
      //     password: 'asdf',
      //     phone_number: '33',
      //     dob: '1991-03-23',
      //     status: 'premium',
      //   },
      // ];
      return getCustomers();
    },
    customer: (parent, args) => {
      return getCustomer(args.id);
    },
    employees: () => {
      return getEmployees();
    },
    employee: (parent, args) => {
      return getEmployee(args.id);
    },
  },
  Mutation: {
    createCustomer: (parent, args) => {
      return createCustomer(args);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
