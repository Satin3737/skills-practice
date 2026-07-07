import type {IMissionsFeedClient, IMissionsFeedData, IMissionsFeedEvents} from './types';

class MissionFeed {
    private clients: Set<IMissionsFeedClient> = new Set<IMissionsFeedClient>();

    public addClient(client: IMissionsFeedClient): () => void {
        this.clients.add(client);
        return () => this.clients.delete(client);
    }

    public broadcast<T extends IMissionsFeedEvents>(event: T, data: IMissionsFeedData[T]): void {
        for (const sendEvent of this.clients) sendEvent(event, data);
    }
}

export default MissionFeed;
