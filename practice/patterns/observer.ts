const CrueMember = {
    pilot: 'pilot',
    captain: 'captain',
    engineer: 'engineer'
} as const;

type ICrueMember = (typeof CrueMember)[keyof typeof CrueMember];
type ICrue = Record<ICrueMember, boolean>;
type ISubscriber = (crue: ICrue) => void;

class ImposterObserver {
    private subscribers: ISubscriber[] = [];

    private crue: ICrue = {
        [CrueMember.pilot]: false,
        [CrueMember.captain]: false,
        [CrueMember.engineer]: false
    };

    public checkCrue(): ICrue {
        return this.crue;
    }

    public subscribe(subscriber: ISubscriber): void {
        this.subscribers.push(subscriber);
    }

    public unsubscribe(subscriber: ISubscriber): void {
        const index = this.subscribers.indexOf(subscriber);
        if (index !== -1) this.subscribers.splice(index, 1);
    }

    public insertImpostor(impostor: ICrueMember): void {
        this.crue[impostor] = true;
        this.impostorAlarm();
    }

    public removeImpostor(impostor: ICrueMember): void {
        this.crue[impostor] = false;
    }

    private impostorAlarm(): void {
        this.subscribers.forEach(subscriber => subscriber(this.crue));
    }
}

const observer = new ImposterObserver();
const listener = (crue: ICrue) => console.log(crue, 'Impostor alarm');

console.log(observer.checkCrue(), 'original crue');

observer.subscribe(listener);

observer.insertImpostor(CrueMember.pilot);
observer.insertImpostor(CrueMember.engineer);
observer.removeImpostor(CrueMember.pilot);

observer.unsubscribe(listener);

observer.insertImpostor(CrueMember.captain);
console.log(observer.checkCrue(), 'final crue');
