import type {IEntityListParams} from '@/common/types';
import type {Mission, PrismaClient} from '@/database/prisma/client';
import type {
    ICreatePlanetMissionsData,
    IMissionListResponse,
    IMissionWithPlanet,
    IMissionWithStormtroopers,
    IUpdateMissionData
} from './types';

class MissionsService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public async getMissions({limit, page, search}: IEntityListParams): Promise<IMissionListResponse> {
        const where = {title: {contains: search, mode: 'insensitive'}} as const;

        const [missions, total] = await this.db.$transaction([
            this.db.mission.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where
            }),
            this.db.mission.count({where})
        ]);

        return {missions, total};
    }

    public getMissionById(id: number): Promise<IMissionWithPlanet> {
        return this.db.mission.findUniqueOrThrow({where: {id}, include: {planet: true}});
    }

    public updateMission(id: number, data: IUpdateMissionData): Promise<Mission> {
        return this.db.mission.update({where: {id}, data});
    }

    public deleteMission(id: number): Promise<Mission> {
        return this.db.mission.delete({where: {id}});
    }

    public async getMissionsByPlanet(
        planetId: number,
        {limit, page, search}: IEntityListParams
    ): Promise<IMissionListResponse> {
        const where = {planetId, title: {contains: search, mode: 'insensitive'}} as const;

        const [missions, total] = await this.db.$transaction([
            this.db.mission.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where
            }),
            this.db.mission.count({where})
        ]);

        return {missions, total};
    }

    public createMissionsForPlanet(planetId: number, missions: ICreatePlanetMissionsData[]): Promise<Mission[]> {
        const data = missions.map(mission => ({...mission, planetId}));
        return this.db.mission.createManyAndReturn({data});
    }

    public assignStormtroopersToMission(
        missionId: number,
        stormtrooperIds: number[]
    ): Promise<IMissionWithStormtroopers> {
        return this.db.mission.update({
            where: {id: missionId},
            data: {stormtroopers: {set: stormtrooperIds.map(id => ({id}))}},
            include: {stormtroopers: true}
        });
    }
}

export default MissionsService;
