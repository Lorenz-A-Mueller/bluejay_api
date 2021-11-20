const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require('apollo-server-errors');
const crypto = require('node:crypto');
const { hashPassword, verifyPassword } = require('./auth.js');
const {
  parseCustomerSessionCookie,
  parseEmployeeSessionCookie,
} = require('./parseCookie');

const {
  getCustomers,
  getCustomerById,
  getCustomerByEmailWithHashedPassword,
  createCustomer,
  getEmployees,
  getEmployeeById,
  getEmployeeByNumberWithHashedPassword,
  createCustomerSession,
  createEmployeeSession,
  deleteExpiredCustomerSessions,
  deleteExpiredEmployeeSessions,
  deleteCustomerSessionByToken,
  getAllTickets,
  getUnclosedTicketByCustomerId,
  getTicketById,
  createTicket,
  deleteTicketById,
  changeTicketStatusByIdAndStatusId,
  getValidCustomerSessionByToken,
  getValidEmployeeSessionByToken,
  getMessageById,
  createMessage,
  createMessageWithResponderId,
  getMessages,
  getStatus,
  getStatuses,
  getCategories,
  getCategory,
  getTicketsByTimeFrame,
  deleteEmployeeSession,
  getPriority,
  getPriorities,
  getRoles,
  getRole,
  changeTicketPriorityByIdAndPriorityId,
  changeTicketAssigneeByIdAndEmployeeId,
  changeTicketLastResponseById,
  getCustomerByEmail,
} = require('./dbFunctions');

exports.resolvers = {
  Query: {
    customers: () => {
      return getCustomers();
    },
    customer: async (parent, args, context) => {
      if (args.search.id) return getCustomerById(args.search.id);
      if (args.search.emailAndPassword) {
        if (
          !args.search.emailAndPassword[0] ||
          !args.search.emailAndPassword[1]
        ) {
          throw new UserInputError('Email and password are required!');
        }

        const hashedPasswordInDb = await getCustomerByEmailWithHashedPassword(
          args.search.emailAndPassword[0],
        );
        const passWordsMatch = await verifyPassword(
          args.search.emailAndPassword[1],
          hashedPasswordInDb.password_hashed,
        );
        if (passWordsMatch) {
          // destructure -> only return the customer without the hashed_password

          const { password_hashed, ...customerWithoutHashedPassword } =
            await getCustomerByEmailWithHashedPassword(
              args.search.emailAndPassword[0],
            );

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
          console.log('this');
          throw new UserInputError(
            'Employee Number and Password are required!',
          );
        }
        console.log('here');

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
      // context.req.headers.cookie is a large string that contains all cookies, must get parsed first
      const cookiesString = context.req.headers.cookie;
      const sessionToken = parseCustomerSessionCookie(cookiesString);
      return getValidCustomerSessionByToken(sessionToken);
    },
    employeeSession: async (parent, args, context) => {
      // context.req.header.cookie only includes the sessionCookie (parsed already via next.js)
      const sessionCookie = context.req.headers.cookie;
      const validationResult = await getValidEmployeeSessionByToken(
        sessionCookie,
      );
      if (typeof validationResult === 'undefined') {
        throw new AuthenticationError('No valid session token.');
      } else {
        return validationResult;
      }
    },
    deleteAllExpiredCustomerSessions: () => {
      return deleteExpiredCustomerSessions();
    },
    tickets: () => {
      return getAllTickets();
    },
    ticket: (parent, args) => {
      if (args.search.id) return getTicketById(args.search.id);
      if (args.search.customer_id) {
        return getUnclosedTicketByCustomerId(args.search.customer_id);
      }
    },
    ticketsByTimeFrame: (parent, args) => {
      return getTicketsByTimeFrame(args.startTime, args.endTime);
    },
    message: (parent, args) => {
      return getMessageById(args.id);
    },
    messages: (parent, args) => {
      return getMessages(args.ticket_id);
    },
    status: (parent, args) => {
      return getStatus(args.id);
    },
    statuses: () => {
      return getStatuses();
    },
    category: (parent, args) => {
      return getCategory(args.id);
    },
    categories: () => {
      return getCategories();
    },
    priority: (parent, args) => {
      return getPriority(args.id);
    },
    priorities: () => {
      return getPriorities();
    },
    roles: () => {
      return getRoles();
    },
    role: (parent, args) => {
      return getRole(args.id);
    },
  },
  Mutation: {
    createCustomer: async (parent, args) => {
      // validation of input
      if (!args.first_name) {
        throw new UserInputError('First Name required.');
      }
      if (!args.last_name) {
        throw new UserInputError('Last Name required.');
      }
      if (!args.email) {
        throw new UserInputError('E-Mail required.');
      }

      if (!/^\S+@\S+\.\S+$/.test(args.email)) {
        throw new UserInputError('Not a valid e-mail format.');
      }
      // check whether email unique in db

      const matchingEmail = await getCustomerByEmail(args.email);
      if (matchingEmail) {
        throw new UserInputError('E-Mail already in use');
      }

      if (!args.phone_number) {
        throw new UserInputError('Phone number required.');
      }
      if (args.phone_number.length < 9) {
        throw new UserInputError(
          'Phone number cannot be less than 9 characters',
        );
      }
      if (args.phone_number.length > 20) {
        throw new UserInputError('Phone number cannot exceed 20 characters.');
      }
      if (!args.dob) {
        throw new UserInputError('Date of Birth is required.');
      }
      if (!/^\d\d-\d\d-\d\d\d\d$/.test(args.dob)) {
        throw new UserInputError(
          'Date of Birth must be entered in format MM-DD-YYYY.',
        );
      }

      if (!args.password) {
        throw new UserInputError('Password required.');
      }
      if (args.password.length < 8) {
        throw new UserInputError(
          'Password to short. Must be at least 8 characters long.',
        );
      }
      if (args.password.length > 20) {
        throw new UserInputError(
          'Password to long. Must not exceed 20 characters.',
        );
      }
      if (!/[A-Z]/g.test(args.password)) {
        throw new UserInputError(
          'Password must contain at least one uppercase letter',
        );
      }

      args.password = await hashPassword(args.password);

      return createCustomer(
        args.first_name,
        args.last_name,
        args.email,
        args.password,
        args.phone_number,
        args.dob,
      );
    },
    createNewTicket: (parent, args) => {
      return createTicket(args.customer_id, args.category, args.title);
    },
    createNewMessage: (parent, args) => {
      return createMessage(args.ticket_id, args.content);
    },
    createNewMessageWithResponderId: async (parent, args, context) => {
      // validation of sessionToken cookie
      if (!context.req.headers.cookie) {
        throw new AuthenticationError('No valid session token.');
      }
      const sessionCookie = parseEmployeeSessionCookie(
        context.req.headers.cookie,
      );
      const validationResult = await getValidEmployeeSessionByToken(
        sessionCookie,
      );
      if (typeof validationResult === 'undefined') {
        throw new AuthenticationError('No valid session token.');
      } else {
        return createMessageWithResponderId(
          args.ticket_id,
          args.content,
          args.responder_id,
        );
      }
    },
    deleteEmployeeSession: (parent, args, context) => {
      const cookiesString = context.req.headers.cookie;
      const sessionToken = parseEmployeeSessionCookie(cookiesString);
      return deleteEmployeeSession(sessionToken);
    },
    deleteCustomerSession: (parent, args, context) => {
      const cookiesString = context.req.headers.cookie;
      const sessionToken = parseCustomerSessionCookie(cookiesString);
      return deleteCustomerSessionByToken(sessionToken);
    },
    deleteTicket: async (parent, args, context) => {
      // validate sessionToken Cookie
      if (!context.req.headers.cookie) {
        throw new AuthenticationError('No valid session token.');
      }
      const sessionCookie = parseEmployeeSessionCookie(
        context.req.headers.cookie,
      );
      const validationResult = await getValidEmployeeSessionByToken(
        sessionCookie,
      );
      if (typeof validationResult === 'undefined') {
        throw new AuthenticationError('No valid session token.');
      } else {
        return deleteTicketById(args.id);
      }
    },
    changeTicketStatus: (parent, args) => {
      return changeTicketStatusByIdAndStatusId(args.id, args.status);
    },
    changeTicketPriority: (parent, args) => {
      return changeTicketPriorityByIdAndPriorityId(args.id, args.priority);
    },
    changeTicketAssignee: (parent, args) => {
      return changeTicketAssigneeByIdAndEmployeeId(args.id, args.assignee_id);
    },
    changeTicketLastResponse: (parent, args) => {
      return changeTicketLastResponseById(args.id);
    },
  },
};
