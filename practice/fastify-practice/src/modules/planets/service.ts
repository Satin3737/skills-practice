import type {IEntityListParams} from '@/common/types';
import type {Planet, PrismaClient} from '@/database/prisma/client';
import type {ICreatePlanetData, IPlanetListResponse, IUpdatePlanetData} from './types';

class PlanetsService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public async getPlanets({limit, page, search}: IEntityListParams): Promise<IPlanetListResponse> {
        const where = {name: {contains: search, mode: 'insensitive'}} as const;

        const [planets, total] = await this.db.$transaction([
            this.db.planet.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where
            }),
            this.db.planet.count({where})
        ]);

        return {planets, total};
    }

    public getPlanetById(id: number): Promise<Planet> {
        return this.db.planet.findUniqueOrThrow({where: {id}});
    }

    public createPlanet(data: ICreatePlanetData): Promise<Planet> {
        return this.db.planet.create({data});
    }

    public updatePlanet(id: number, data: IUpdatePlanetData): Promise<Planet> {
        return this.db.planet.update({where: {id}, data});
    }

    public deletePlanet(id: number): Promise<Planet> {
        return this.db.planet.delete({where: {id}});
    }
}

export default PlanetsService;
