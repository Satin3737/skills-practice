import {initTRPC} from '@trpc/server';
import {z} from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const users = [
    {id: 1, name: 'Colin Robinson', age: 116},
    {id: 2, name: 'Bobby Brown', age: 42}
];

export const appRouter = router({
    user: router({
        getById: publicProcedure.input(z.object({id: z.number()})).query(({input}) => {
            return users.find(u => u.id === input.id) ?? null;
        }),

        list: publicProcedure.query(() => users),

        create: publicProcedure
            .input(
                z.object({
                    name: z.string().min(1),
                    age: z.number().int().positive()
                })
            )
            .mutation(({input}) => {
                const newUser = {id: users.length + 1, ...input};
                users.push(newUser);
                return newUser;
            })
    })
});

export type AppRouter = typeof appRouter;
