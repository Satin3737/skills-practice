const MetersPerAu = 149_597_870_700;

class WarpJump {
    public readonly targetName: string;
    public readonly distanceAu: number;

    public constructor(targetName: string, distanceAu: number) {
        this.targetName = targetName;
        this.distanceAu = distanceAu;
    }

    public initiateJump(shipName: string): void {
        console.log(`${shipName} jump to ${this.targetName} with distance ${this.distanceAu} initiated!`);
    }
}

class Ship {
    public readonly name: string;
    public readonly driveClass: number = 0;
    public readonly fuelCapacity: number = 0;

    public constructor(name: string, driveClass?: number, fuelCapacity?: number) {
        this.name = name;
        if (driveClass !== undefined) this.driveClass = driveClass;
        if (fuelCapacity !== undefined) this.fuelCapacity = fuelCapacity;
    }

    public jump(target: WarpJump): void {
        if (this.canJump(target)) {
            target.initiateJump(this.name);
        } else {
            console.log(`${this.name} warp distance not enough for jump to ${target.targetName}!`);
        }
    }

    public getMaxWarpDistanceAu(): number {
        return this.driveClass * this.fuelCapacity;
    }

    public canJump(target: WarpJump): boolean {
        return target.distanceAu <= this.getMaxWarpDistanceAu();
    }
}

class ShipPrototype {
    public readonly name: string;
    public readonly documentedMaxWarpDistanceMeters: string;

    public constructor(name: string, distanceMeters: string) {
        this.name = name;
        this.documentedMaxWarpDistanceMeters = distanceMeters;
    }
}

class ShipAdapter extends Ship {
    private readonly shipPrototype: ShipPrototype;
    private readonly calibratedDistance: number;

    public constructor(shipPrototype: ShipPrototype) {
        super(shipPrototype.name);
        this.shipPrototype = shipPrototype;
        this.calibratedDistance = Number(this.shipPrototype.documentedMaxWarpDistanceMeters.replaceAll('_', ''));
    }

    public override getMaxWarpDistanceAu(): number {
        if (!this.calibratedDistance || isNaN(this.calibratedDistance)) return 0;
        return this.calibratedDistance / MetersPerAu;
    }
}

type IJumpTargetKey = 'earth' | 'mars' | 'jupiter' | 'pluto';
type IShipKey = 'anaconda' | 'imperialCutter';
type IPrototypeKey = 'anacondaMk2' | 'kratePhantomMk3';

class SunJumpStation {
    public readonly jumpTargets: Record<IJumpTargetKey, WarpJump>;
    public readonly ships: Record<IShipKey, Ship>;
    public readonly prototypes: Record<IPrototypeKey, ShipPrototype>;
    public readonly calibratedPrototypes: Record<IPrototypeKey, Ship>;

    public constructor() {
        this.jumpTargets = {
            earth: new WarpJump('Earth', 1),
            mars: new WarpJump('Mars', 1.52),
            jupiter: new WarpJump('Jupiter', 5.2),
            pluto: new WarpJump('Pluto', 39.5)
        };

        this.ships = {
            anaconda: new Ship('Anaconda', 4, 8),
            imperialCutter: new Ship('Imperial Cutter', 8, 3.2)
        };

        this.prototypes = {
            anacondaMk2: new ShipPrototype('Anaconda Mk 2', '860_600_000_000'),
            kratePhantomMk3: new ShipPrototype('Krate Phantom Mk3', '390_800_000_000')
        };

        this.calibratedPrototypes = {
            anacondaMk2: new ShipAdapter(this.prototypes.anacondaMk2),
            kratePhantomMk3: new ShipAdapter(this.prototypes.kratePhantomMk3)
        };
    }
}

const sunJumpStation = new SunJumpStation();

sunJumpStation.ships.anaconda.jump(sunJumpStation.jumpTargets.jupiter);
sunJumpStation.ships.imperialCutter.jump(sunJumpStation.jumpTargets.pluto);
sunJumpStation.ships.imperialCutter.jump(sunJumpStation.jumpTargets.earth);

// can't jump, prototype ship don't include jump method
// sunJumpStation.prototypes.anacondaMk2.jump(...);

sunJumpStation.calibratedPrototypes.anacondaMk2.jump(sunJumpStation.jumpTargets.jupiter);
sunJumpStation.calibratedPrototypes.kratePhantomMk3.jump(sunJumpStation.jumpTargets.mars);
sunJumpStation.calibratedPrototypes.kratePhantomMk3.jump(sunJumpStation.jumpTargets.jupiter);
