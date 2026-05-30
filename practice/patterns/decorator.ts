abstract class Trooper {
    public abstract readonly callSign: string;

    public abstract equipment: string;

    protected readonly divider: string = ' | ';

    public abstract setEquipment(additionalEquipment: string): void;

    public abstract getEquipment(): string;
}

class Stormtrooper extends Trooper {
    public readonly callSign: string;

    public equipment: string = 'Stormtrooper';

    public constructor(callSign: string) {
        super();
        this.callSign = callSign;
    }

    public setEquipment(additionalEquipment: string) {
        this.equipment = this.equipment + this.divider + additionalEquipment;
    }

    public getEquipment() {
        return `${this.callSign}: ${this.equipment}`;
    }
}

class StormtrooperDecorator extends Trooper {
    protected readonly wrapper: Trooper;

    public constructor(trooper: Trooper) {
        super();
        this.wrapper = trooper;
    }

    public get callSign(): string {
        return this.wrapper.callSign;
    }

    public get equipment(): string {
        return this.wrapper.equipment;
    }

    public setEquipment(additionalEquipment: string): void {
        this.wrapper.setEquipment(additionalEquipment);
    }

    public getEquipment(): string {
        return this.wrapper.getEquipment();
    }
}

class ScouttrooperDecorator extends StormtrooperDecorator {
    public constructor(trooper: Trooper) {
        super(trooper);
        this.wrapper.setEquipment('Sniper Rifle');
    }
}

class PilottrooperDecorator extends StormtrooperDecorator {
    public constructor(trooper: Trooper) {
        super(trooper);
        this.wrapper.setEquipment('TIE Fighter');
    }
}

class SnowtrooperDecorator extends StormtrooperDecorator {
    public constructor(trooper: Trooper) {
        super(trooper);
        this.wrapper.setEquipment('Heated armor');
    }
}

const BattleEnvironment = {
    regular: 'regular',
    snow: 'snow',
    space: 'space',
    jungle: 'jungle'
} as const;

type IBattleEnvironment = (typeof BattleEnvironment)[keyof typeof BattleEnvironment];

type IEnvironment = IBattleEnvironment | `${IBattleEnvironment} ${string}`;

class Battle {
    private environment: IEnvironment;

    private readonly decorators: Record<IBattleEnvironment, new (t: Trooper) => Trooper> = {
        [BattleEnvironment.regular]: StormtrooperDecorator,
        [BattleEnvironment.snow]: SnowtrooperDecorator,
        [BattleEnvironment.space]: PilottrooperDecorator,
        [BattleEnvironment.jungle]: ScouttrooperDecorator
    };

    public constructor(environment?: IEnvironment) {
        this.environment = environment ?? BattleEnvironment.regular;
    }

    public setEnvironment(environment: IEnvironment) {
        this.environment = environment;
    }

    public isEnvironmentExists(env: string): env is IBattleEnvironment {
        return Object.values<string>(BattleEnvironment).includes(env);
    }

    public createTrooper(trooper: Trooper): Trooper {
        return this.environment.split(' ').reduce<Trooper>((acc, environment) => {
            if (!this.isEnvironmentExists(environment)) return acc;
            return new this.decorators[environment](acc);
        }, trooper);
    }
}

const battle = new Battle();

const stormtrooper1 = battle.createTrooper(new Stormtrooper('NI-4-12'));
stormtrooper1.setEquipment('E-11 bluster');
console.log(stormtrooper1.getEquipment());

battle.setEnvironment(BattleEnvironment.space);

const stormtrooper2 = battle.createTrooper(new Stormtrooper('GT-6-22'));
stormtrooper2.setEquipment('Comlink Device');
console.log(stormtrooper2.getEquipment());

battle.setEnvironment(`${BattleEnvironment.snow} ${BattleEnvironment.jungle}`);

const stormtrooper3 = battle.createTrooper(new Stormtrooper('WR-2-04'));
stormtrooper3.setEquipment('Heavy armor');
console.log(stormtrooper3.getEquipment());

battle.setEnvironment(`${BattleEnvironment.snow} ${BattleEnvironment.space} ${BattleEnvironment.jungle}`);

const stormtrooper4 = battle.createTrooper(new Stormtrooper('TK-8-16'));
stormtrooper4.setEquipment('IDDQD');
stormtrooper4.setEquipment('whosyourdaddy');
console.log(stormtrooper4.getEquipment());

const stormtrooper5 = battle.createTrooper(new Stormtrooper('VD-12-08'));
console.log(stormtrooper5.getEquipment());
