export const Environment = {
    development: 'development',
    production: 'production',
    test: 'test'
} as const;

export const RedisSubChannel = {
    missionsFeed: 'missions:feed'
} as const;

export const QueueType = {
    email: 'email'
} as const;
