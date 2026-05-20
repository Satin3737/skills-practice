export const rawSchema = /* GraphQL */ `
    type User {
        id: Int!
        name: String!
        age: Int!
    }

    input CreateUserInput {
        name: String!
        age: Int!
    }

    type Query {
        user(id: Int!): User
        users(name: String, age: Int): [User!]!
    }

    type Mutation {
        createUser(input: CreateUserInput!): User
    }
`;
