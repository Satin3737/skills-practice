export const RoomObjects = {
    table: 'table',
    window: 'window',
    sofa: 'sofa'
} as const;

export type IRoomObjects = (typeof RoomObjects)[keyof typeof RoomObjects];
