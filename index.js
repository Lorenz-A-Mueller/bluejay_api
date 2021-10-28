const { ApolloServer, gql } = require('apollo-server');
const { AuthenticationError } = require('apollo-server-errors');
const setPostgresDefaultsOnHeroku = require('./setPostgresDefaultsOnHeroku.js');
const { hashPassword, verifyPassword } = require('./utils/auth.js');

require('dotenv').config();
const postgres = require('postgres');

setPostgresDefaultsOnHeroku();

// const sql = postgres();

// Connect only once to the database
// https://github.com/vercel/next.js/issues/7811#issuecomment-715259370
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

async function getCustomers() {
  const customers = await sql`
  SELECT
  number, first_name, last_name, email, password_hashed, phone_number, dob, status
  FROM customers;
  `;
  return customers;
}

async function getCustomerById(id) {
  const customer = await sql`
  SELECT
  number, first_name, last_name, email, phone_number, dob, status
  FROM customers
  WHERE id=${id};

  `;
  return customer[0];
}

async function getCustomerByNumberWithHashedPassword(number) {
  const customer = await sql`
  SELECT * FROM customers
  WHERE number=${number};

  `;
  return customer[0];
}

async function createCustomer(newCustomer) {
  const customer = await sql`
  INSERT INTO customers
  (first_name, last_name, email, password, phone_number, dob, status)
  VALUES
  (${newCustomer.first_name}, ${newCustomer.last_name}, ${newCustomer.email}, ${newCustomer.password}, ${newCustomer.phone_number}, ${newCustomer.dob}, ${newCustomer.status})
  RETURNING
  (first_name, last_name, email, phone_number, dob, status)
  `;
  return customer[0];
}

async function getEmployees() {
  const employees = await sql`
  SELECT
  number, first_name, last_name, email, dob, admin
  FROM employees;
  `;
  return employees;
}

async function getEmployeeById(id) {
  const employee = await sql`
  SELECT
  number, first_name, last_name, email, password_hashed, dob, admin
  FROM employees
  WHERE id=${id};

  `;
  return employee[0];
}

async function getEmployeeByNumberWithHashedPassword(number) {
  const employee = await sql`
  SELECT * FROM employees
  WHERE number=${number};

  `;
  return employee[0];
}

const typeDefs = gql`
  scalar Date
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
  # type CustomerWithoutPassword {
  #   id: ID
  #   number: String
  #   first_name: String
  #   last_name: String
  #   email: String
  #   phone_number: String
  #   dob: Date
  #   status: String
  # }
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
  # type EmployeeWithoutPassword {
  #   id: ID
  #   number: String
  #   first_name: String
  #   last_name: String
  #   email: String
  #   dob: Date
  #   admin: Boolean
  # }
`;

const resolvers = {
  Query: {
    customers: () => {
      return getCustomers();
    },
    customer: async (parent, args) => {
      if (args.search.id) return getCustomerById(args.search.id);
      if (args.search.number) {
        console.log('first arg: ', args.search.number[0]);
        console.log('second arg: ', args.search.number[1]);

        const hashedPasswordInDb = await getCustomerByNumberWithHashedPassword(
          args.search.number[0],
        );
        console.log(
          'hashed password in db: ',
          hashedPasswordInDb.password_hashed,
        );
        const passWordsMatch = await verifyPassword(
          args.search.number[1],
          hashedPasswordInDb.password_hashed,
        );
        console.log('passwordsmatch', passWordsMatch);
        if (passWordsMatch) {
          const { password_hashed, ...customerWithoutHashedPassword } =
            await getCustomerByNumberWithHashedPassword(args.search.number[0]);
          return customerWithoutHashedPassword;
        }
        // if (!passWordsMatch) {
        throw new AuthenticationError(
          'Password/Username combination did not match!',
        );
        // }
        // return;
      }
    },
    employees: () => {
      return getEmployees();
    },
    employee: (parent, args) => {
      if (args.search.id) return getEmployeeById(args.search.id);
      if (args.search.number) {
        return getEmployeeByNumberWithHashedPassword(args.search.number[0]);
      }
    },
  },
  Mutation: {
    createCustomer: (parent, args) => {
      args.password = hashPassword(args.password);
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
