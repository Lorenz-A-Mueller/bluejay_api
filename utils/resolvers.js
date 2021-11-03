const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const crypto = require('node:crypto');
const { hashPassword, verifyPassword } = require('./auth.js');

const {
  getCustomers,
  getCustomerById,
  getCustomerByNumberWithHashedPassword,
  createCustomer,
  getEmployees,
  getEmployeeById,
  getEmployeeByNumberWithHashedPassword,
  createCustomerSession,
  createEmployeeSession,
  deleteExpiredCustomerSessions,
  deleteExpiredEmployeeSessions,
  getAllTickets,
  getTicketById,
  createTicket,
  getValidCustomerSessionByToken,
  getValidEmployeeSessionByToken,
  getMessageById,
  createMessage,
} = require('./dbFunctions');

exports.resolvers = {
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
          context.res.cookie('customerSessionToken', newSession.token, {
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
    employee: async (parent, args, context) => {
      if (args.search.id) return getEmployeeById(args.search.id);
      if (args.search.number) {
        console.log('first arg: ', args.search.number[0]);
        console.log('second arg: ', args.search.number[1]);

        if (!args.search.number[0] || !args.search.number[1]) {
          throw new UserInputError(
            'Employee Number and Password are required!',
          );
        }

        const hashedPasswordInDb = await getEmployeeByNumberWithHashedPassword(
          args.search.number[0],
        );

        const passWordsMatch = await verifyPassword(
          args.search.number[1],
          hashedPasswordInDb.password_hashed,
        );
        console.log('passwordsmatch', passWordsMatch);
        if (passWordsMatch) {
          // destructure -> only return the employee without the hashed_password

          const { password_hashed, ...employeeWithoutHashedPassword } =
            await getEmployeeByNumberWithHashedPassword(args.search.number[0]);

          // clean ALL expired sessions

          deleteExpiredEmployeeSessions();

          // generate a random token

          const token = crypto.randomBytes(64).toString('base64');

          // safe token and client id as a session in the DB

          const newSession = await createEmployeeSession(
            token,
            employeeWithoutHashedPassword.id,
          );

          // set employee's sessionToken cookie with the stored token value
          context.res.cookie('employeeSessionToken', newSession.token, {
            httpOnly: true,
          });

          return employeeWithoutHashedPassword;
          // context.res.sendStatus(200); // ???
        }
        // if (!passWordsMatch) {
        throw new AuthenticationError(
          'Employee Number / Password combination did not match!',
        );
      }
    },
    customerSession: (parent, args, context) => {
      // console.log('args.token', args.token);
      const cookieWithName = context.req.headers.cookie;
      const sessionCookieEscapeCharacters = cookieWithName.split('=')[1];
      const sessionCookie = sessionCookieEscapeCharacters
        .replace(/\%3D/g, '=')
        .replace(/\%2B/g, '+')
        .replace(/\%2F/g, '/');
      console.log('sessionCookie: ', sessionCookie);

      return getValidCustomerSessionByToken(sessionCookie);
    },
    employeeSession: (parent, args, context) => {
      // cookie gets already sent in the right form
      const sessionCookie = context.req.headers.cookie;

      console.log('sessionCookie: ', sessionCookie);

      return getValidEmployeeSessionByToken(sessionCookie);
    },
    deleteAllExpiredCustomerSessions: () => {
      return deleteExpiredCustomerSessions();
    },
    tickets: () => {
      return getAllTickets();
    },
    ticket: (parent, args) => {
      return getTicketById(args.id);
    },
    message: (parent, args) => {
      return getMessageById(args.id);
    },
  },
  Mutation: {
    createCustomer: (parent, args) => {
      args.password = hashPassword(args.password);
      return createCustomer(args);
    },
    createNewTicket: (parent, args) => {
      return createTicket(
        args.customer_id,
        args.category,
        args.title,
        args.messages,
      );
    },
    createNewMessage: (parent, args) => {
      return createMessage(args.customer_id, args.content);
    },
  },
};
