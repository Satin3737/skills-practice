const Event = {
    flawlessVictory: 'flawlessVictory',
    fatality: 'fatality',
    brutality: 'brutality'
} as const;

type IEvent = (typeof Event)[keyof typeof Event];

interface IEventData {
    [Event.flawlessVictory]: {
        winner: string;
        looser: string;
    };
    [Event.fatality]: {
        winner: string;
        fatalityType: string;
    };
    [Event.brutality]: {
        looser: string;
        brutalityType: string;
    };
}

type IEventCb<T extends IEvent> = (params: IEventData[T]) => void;

type IEventsArrays = {[K in IEvent]: IEventCb<K>[]};

class CombatEvents {
    private events: IEventsArrays;

    public constructor() {
        this.events = Object.values<IEvent>(Event).reduce<IEventsArrays>((acc, event) => {
            acc[event] = [];
            return acc;
        }, {} as IEventsArrays);
    }

    public subscribe<T extends IEvent>(name: T, cb: IEventCb<T>): void {
        (this.events[name] as IEventCb<T>[]).push(cb);
    }

    public unsubscribe<T extends IEvent>(name: T, cb: IEventCb<T>): void {
        const index = this.events[name].indexOf(cb);
        if (index !== -1) this.events[name].splice(index, 1);
    }

    public triggerEvent<T extends IEvent>(name: T, params: IEventData[T]): void {
        (this.events[name] as IEventCb<T>[]).forEach(cb => cb(params));
    }
}

const combat = new CombatEvents();

const fatalitySubscriber: IEventCb<'fatality'> = params => {
    console.log(`${params.winner} do fatality ${params.fatalityType}`);
};

const flawlessSubscriber: IEventCb<'flawlessVictory'> = params => {
    console.log(`${params.winner} do flawlessVictory on ${params.looser}`);
};

combat.subscribe(Event.fatality, fatalitySubscriber);
combat.subscribe(Event.flawlessVictory, flawlessSubscriber);

combat.triggerEvent(Event.fatality, {winner: 'Sub-zero', fatalityType: 'frozen'});
combat.triggerEvent(Event.flawlessVictory, {winner: 'Sub-zero', looser: 'Scorpion'});

combat.unsubscribe(Event.fatality, fatalitySubscriber);
combat.triggerEvent(Event.fatality, {winner: 'Sub-zero', fatalityType: 'frozen'});
