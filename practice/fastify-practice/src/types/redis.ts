import {RedisSubChannel} from '@/common/const';
import type {IMissionFeedMessage} from '@/modules/missions/types';

export interface IRedisChannelPayloads {
    [RedisSubChannel.missionsFeed]: IMissionFeedMessage;
}
