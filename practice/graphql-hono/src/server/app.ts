import {type RootResolver, graphqlServer} from '@hono/graphql-server';
import {serve} from '@hono/node-server';
import {GraphQLError} from 'graphql';
import {buildSchema} from 'graphql/utilities';
import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {logger} from 'hono/logger';
import {z} from 'zod';
import type {MutationCreateUserArgs, QueryUserArgs, QueryUsersArgs, User} from '@/__generated__/resolvers';
import {rawSchema} from '@/graphql/schema';
import {Users} from './data';
import {CreateUserSchema} from './validation';

const schema = buildSchema(rawSchema);

const rootResolver: RootResolver = () => ({
    user: ({id}: QueryUserArgs): User | null => Users.find(u => u.id === id) ?? null,
    users: ({name, age}: QueryUsersArgs): User[] => {
        return Users.filter(u => {
            return (!name || u.name.toLowerCase().includes(name.toLowerCase())) && (!age || u.age === age);
        });
    },
    createUser: ({input}: MutationCreateUserArgs): User => {
        const {success, data, error} = CreateUserSchema.safeParse(input);

        if (!success) {
            throw new GraphQLError('Validation failed', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    http: {status: 400},
                    errors: z.flattenError(error).fieldErrors
                }
            });
        }

        const user: User = {id: Math.max(1, ...Users.map(u => u.id)) + 1, ...data};
        Users.push(user);
        return user;
    }
});

const app = new Hono();

app.use(cors({origin: 'http://localhost:5177'}), logger());
app.use('/graphql', graphqlServer({schema, rootResolver}));

serve({fetch: app.fetch, port: 8080}, info => {
    console.log(`Server running on http://localhost:${info.port}`);
});
