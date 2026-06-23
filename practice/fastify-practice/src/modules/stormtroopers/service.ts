import type {IEntityListParams} from '@/common/types';
import type {PrismaClient, Stormtrooper} from '@/database/prisma/client';
import type {ICreateStormtrooperData, IStormtrooperListResponse, IUpdateStormtrooperData} from './types';

class StormtrooperService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public async getStormtroopers({limit, page, search}: IEntityListParams): Promise<IStormtrooperListResponse> {
        const where = {callSign: {contains: search, mode: 'insensitive'}} as const;

        const [stormtroopers, total] = await this.db.$transaction([
            this.db.stormtrooper.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where
            }),
            this.db.stormtrooper.count({where})
        ]);

        return {stormtroopers, total};
    }

    public getStormtrooperById(id: number): Promise<Stormtrooper> {
        return this.db.stormtrooper.findUniqueOrThrow({where: {id}});
    }

    public createStormtrooper(data: ICreateStormtrooperData): Promise<Stormtrooper> {
        return this.db.stormtrooper.create({data});
    }

    public updateStormtrooper(id: number, data: IUpdateStormtrooperData): Promise<Stormtrooper> {
        return this.db.stormtrooper.update({where: {id}, data});
    }

    public deleteStormtrooper(id: number): Promise<Stormtrooper> {
        return this.db.stormtrooper.delete({where: {id}});
    }
}

export default StormtrooperService;
