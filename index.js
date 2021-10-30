const { ApolloServer, gql } = require('apollo-server-express');
const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const crypto = require('node:crypto');
const setPostgresDefaultsOnHeroku = require('./setPostgresDefaultsOnHeroku.js');
const { hashPassword, verifyPassword } = require('./utils/auth.js');
const cors = require('cors');
const express = require('express');

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

async function createCustomerSession(token, id) {
  const session = await sql`
  INSERT INTO customer_sessions
  (token, customer_id)
  VALUES
  (${token}, ${id})
  RETURNING *
  `;
  return session[0];
}

async function deleteExpiredCustomerSessions() {
  const sessions = await sql`
  DELETE FROM customer_sessions
  WHERE
  expiry_timestamp < NOW()
  RETURNING *
  `;
  return sessions;
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
    customer: async (parent, args, context) => {
      if (args.search.id) return getCustomerById(args.search.id);
      if (args.search.number) {
        console.log('first arg: ', args.search.number[0]);
        console.log('second arg: ', args.search.number[1]);

        if (!args.search.number[0] || !args.search.number[1]) {
          throw new UserInputError('Password and Username are required!');
        }

        const hashedPasswordInDb = await getCustomerByNumberWithHashedPassword(
          args.search.number[0],
        );
        // console.log(
        //   'hashed password in db: ',
        //   hashedPasswordInDb.password_hashed,
        // );
        const passWordsMatch = await verifyPassword(
          args.search.number[1],
          hashedPasswordInDb.password_hashed,
        );
        console.log('passwordsmatch', passWordsMatch);
        if (passWordsMatch) {
          // destructure -> only return the customer without the hashed_password

          const { password_hashed, ...customerWithoutHashedPassword } =
            await getCustomerByNumberWithHashedPassword(args.search.number[0]);

          // clean ALL expired sessions

          deleteExpiredCustomerSessions();

          // generate a random token

          const token = crypto.randomBytes(64).toString('base64');

          // safe token and client id as a session in the DB

          const newSession = await createCustomerSession(
            token,
            customerWithoutHashedPassword.id,
          );

          // set client's sessionToken cookie with the stored token value
          context.res.cookie('sessionToken', newSession.token, {
            httpOnly: true,
          });

          return customerWithoutHashedPassword;
          // context.res.sendStatus(200); // ???
        }
        // if (!passWordsMatch) {
        throw new AuthenticationError(
          'Password/Username combination did not match!',
        );
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

const app = express();
const corsOptions = {
  origin: 'http://localhost:19006',
  credentials: true,
};
app.use(cors(corsOptions));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ res }) => ({
    res,
  }),
});

const main = async () => {
  await server.start();

  server.applyMiddleware({ app, cors: false, path: '/graphql' });

  // app.get('/rest', (req, res) => {
  //   res.json({
  //     data: 'API is working...',
  //   });
  // });

  app.listen(process.env.PORT || 4000, () => {
    console.log(`🚀  Server ready at port ${process.env.PORT || 4000}`);
  });
};

main();
