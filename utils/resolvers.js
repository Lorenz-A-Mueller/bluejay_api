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
  createMessageWithResponderId,
  deleteEmployeeSessionByEmployeeId,
  getMessages,
} = require('./dbFunctions');

exports.resolvers = {
  Query: {
    customers: () => {
      return getCustomers();
    },
    customer: async (parent, args, context) => {
      if (args.search.id) return getCustomerById(args.search.id);
      if (args.search.number) {
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

          // set token as cookie
          context.res.cookie('customerSessionToken', newSession.token, {
            httpOnly: true,
          });

          return customerWithoutHashedPassword;
          // context.res.sendStatus(200); // ???
        }

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

          // set token as cookie

          context.res.cookie('employeeSessionToken', newSession.token, {
            httpOnly: true,
          });

          return employeeWithoutHashedPassword;
          // context.res.sendStatus(200); // ???
        }
        throw new AuthenticationError(
          'Employee Number / Password combination did not match!',
        );
      }
    },
    customerSession: (parent, args, context) => {
      const cookiesString = context.req.headers.cookie;
      const sessionCookieEscapeCharacters = cookiesString.split(
        'customerSessionToken=',
      )[1];
      const sessionCookie = sessionCookieEscapeCharacters
        .replace(/%3D/g, '=')
        .replace(/%2B/g, '+')
        .replace(/%2F/g, '/');
      return getValidCustomerSessionByToken(sessionCookie);
    },
    employeeSession: (parent, args, context) => {
      // cookie gets already sent in the right form
      const sessionCookie = context.req.headers.cookie;
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
    messages: (parent, args) => {
      return getMessages(args.ticket_id);
    },
  },
  Mutation: {
    createCustomer: (parent, args) => {
      // #TODO
      args.password = hashPassword(args.password);
      return createCustomer(args);
    },
    createNewTicket: (parent, args) => {
      return createTicket(args.customer_id, args.category, args.title);
    },
    createNewMessage: (parent, args) => {
      return createMessage(args.ticket_id, args.content);
    },
    createNewMessageWithResponderId: (parent, args) => {
      return createMessageWithResponderId(
        args.ticket_id,
        args.content,
        args.responder_id,
      );
    },
    deleteEmployeeSession: (parent, args) => {
      return deleteEmployeeSessionByEmployeeId(args.employee_id);
    },
  },
};
