// prototype inheritance before classes
function Animal(
    this: {
        name: string;
        sound: string;
    },
    name: string,
    sound: string
) {
    this.name = name;
    this.sound = sound;
}

Animal.prototype.speak = function () {
    console.log(`${this.name} doing ${this.sound}`);
};

function Dog(
    this: {
        name: string;
        sound: string;
        breed: string;
    },
    name: string,
    breed: string
) {
    Animal.call(this, name, 'woof');
    this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.catch = function () {
    console.log(`${this.name} catch the ball`);
};

const DogCtor = Dog as unknown as new (
    name: string,
    breed: string
) => {name: string; sound: string; breed: string; speak(): void; catch(): void};

const dog = new DogCtor('Rex', 'Labrador');

dog.speak(); // Rex doing woof that inherited from Animal.prototype
dog.catch(); // Rex catch the ball

console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true because chain Dog.prototype -> Animal.prototype

// ----------------------

// class syntax
abstract class Vehicle {
    protected readonly name: string;
    private speed: number = 0;

    protected constructor(name: string) {
        this.name = name;
    }

    public static compare(a: Vehicle, b: Vehicle): number {
        return a.speed - b.speed;
    }

    protected accelerate(amount: number): void {
        this.speed += amount;
        console.log(`${this.name} speed: ${this.speed}`);
    }

    protected abstract describe(): string;
}

class Car extends Vehicle {
    private readonly brand: string;
    #mileage = 0; // JS private field — truly private at runtime (vs TS private)

    public constructor(name: string, brand: string) {
        super(name);
        this.brand = brand;
    }

    public drive(km: number): void {
        this.#mileage += km;
        console.log(`${this.describe()} drove ${km}km, total: ${this.#mileage}km`);
    }

    public accelerate(amount: number): void {
        super.accelerate(amount);
        console.log('vroom');
    }

    protected describe(): string {
        return `${this.brand} ${this.name}`;
    }
}

const car = new Car('Model 3', 'Tesla');
car.drive(100);
car.accelerate(50);

// class inheritance
console.log(car instanceof Car); // true
console.log(car instanceof Vehicle); // true

// prototype chain
console.log(Object.getPrototypeOf(car) === Car.prototype); // true
console.log(Object.getPrototypeOf(Car.prototype) === Vehicle.prototype); // true

// methods in prototype, not instance
console.log(Object.hasOwn(car, 'name')); // true  — set in constructor
console.log(Object.hasOwn(car, 'accelerate')); // false — lives on Car.prototype
