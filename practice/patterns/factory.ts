const PokemonType = {
    fire: 'fire',
    water: 'water',
    grass: 'grass'
} as const;

type IPokemonType = (typeof PokemonType)[keyof typeof PokemonType];

abstract class Pokemon {
    public readonly name: string;
    public readonly type: IPokemonType;

    public constructor(name: string, type: IPokemonType) {
        this.name = name;
        this.type = type;
    }

    public abstract atack(): void;
}

class FirePokemon extends Pokemon {
    public constructor(name: string) {
        super(name, PokemonType.fire);
    }

    public atack(): void {
        console.log(`${this.name} use Fire atack!`);
    }
}

class WaterPokemon extends Pokemon {
    public constructor(name: string) {
        super(name, PokemonType.water);
    }

    public atack(): void {
        console.log(`${this.name} use Water atack!`);
    }
}

class GrassPokemon extends Pokemon {
    public constructor(name: string) {
        super(name, PokemonType.grass);
    }

    public atack(): void {
        console.log(`${this.name} use Grass atack!`);
    }
}

abstract class PokemonFactory {
    abstract createPokemon(name: string): Pokemon;
}

class FirePokemonFactory extends PokemonFactory {
    public createPokemon(name: string): Pokemon {
        return new FirePokemon(name);
    }
}

class WaterPokemonFactory extends PokemonFactory {
    public createPokemon(name: string): Pokemon {
        return new WaterPokemon(name);
    }
}

class GrassPokemonFactory extends PokemonFactory {
    public createPokemon(name: string): Pokemon {
        return new GrassPokemon(name);
    }
}

const pokemonBattle = () => {
    const firePokemonFactory = new FirePokemonFactory();
    const waterPokemonFactory = new WaterPokemonFactory();
    const grassPokemonFactory = new GrassPokemonFactory();

    const charmander = firePokemonFactory.createPokemon('Charmander');
    const squirtle = waterPokemonFactory.createPokemon('Squirtle');
    const bulbasaur = grassPokemonFactory.createPokemon('Bulbasaur');

    charmander.atack();
    squirtle.atack();
    bulbasaur.atack();
};

pokemonBattle();
