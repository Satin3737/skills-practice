class Enemy {
    private _health: number = 10;

    public get health(): number {
        return this._health;
    }

    public takeDamage(amount: number): void {
        this._health -= amount;
    }

    public isDead(): boolean {
        return this._health <= 0;
    }
}

abstract class HeroStrategy {
    protected readonly damage: number;

    public constructor(damage: number) {
        this.damage = damage;
    }

    public abstract attack(enemy: Enemy): void;
}

class SwordStrategy extends HeroStrategy {
    public constructor() {
        super(2);
    }

    public attack(enemy: Enemy): void {
        enemy.takeDamage(this.damage);
        console.log(`Sword slash dealt ${this.damage} damage, enemy health: ${enemy.health}`);
    }
}

class HammerStrategy extends HeroStrategy {
    public constructor() {
        super(4);
    }

    public attack(enemy: Enemy): void {
        enemy.takeDamage(this.damage);
        console.log(`Hammer bash dealt ${this.damage} damage, enemy health: ${enemy.health}`);
    }
}

class SpellStrategy extends HeroStrategy {
    public constructor() {
        super(6);
    }

    public attack(enemy: Enemy): void {
        enemy.takeDamage(this.damage);
        console.log(`Spell cast dealt ${this.damage} damage, enemy health: ${enemy.health}`);
    }
}

class Hero {
    private strategy: HeroStrategy;

    public constructor(strategy: HeroStrategy) {
        this.strategy = strategy;
    }

    public changeStrategy(strategy: HeroStrategy): void {
        this.strategy = strategy;
    }

    public attack(enemy: Enemy): void {
        this.strategy.attack(enemy);
    }
}

const enemy = new Enemy();

const sword = new SwordStrategy();
const hammer = new HammerStrategy();
const spell = new SpellStrategy();

const hero = new Hero(sword);
hero.attack(enemy);

hero.changeStrategy(hammer);
hero.attack(enemy);

hero.changeStrategy(spell);
hero.attack(enemy);

hero.changeStrategy(sword);
hero.attack(enemy);

console.log(enemy.isDead(), 'is dead');
