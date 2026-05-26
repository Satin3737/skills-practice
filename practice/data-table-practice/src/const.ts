export const ApiBaseUrl = 'https://jsonplaceholder.typicode.com';

export const QueryKey = {
    posts: 'posts',
    users: 'users',
    comments: 'comments'
} as const;

export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
} as const;

export const Limit = {
    5: 5,
    10: 10,
    15: 15,
    20: 20,
    25: 25
} as const;
