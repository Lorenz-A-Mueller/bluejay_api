import { ApolloServer, gql } from 'apollo-server';

const typeDefs = gql`
  type Customer {
    id: Integer
    first_name: String
    last_name: String
    email: String
    password: String
    phone_number: String
    dob: Date
    status: String
  }
  type Query {
    customers: [Customer]
  }
`;
