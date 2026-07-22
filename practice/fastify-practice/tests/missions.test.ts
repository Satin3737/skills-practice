import type {FastifyInstance} from 'fastify';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {UserRank} from '@/database/prisma/enums';
import {buildTestApp} from './helpers/build-app';
import {signAccessToken} from './helpers/jwt';

describe('missions', () => {
    let app: FastifyInstance;
    let planetId: number;
    let missionId: number;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    beforeEach(async () => {
        vi.spyOn(app.emailQueue, 'add').mockImplementation(vi.fn());

        const planet = await app.prisma.planet.create({data: {name: 'Hoth', size: 7200, type: 'exoplanet'}});
        planetId = planet.id;

        const mission = await app.prisma.mission.create({
            data: {title: 'Scout the base', briefing: 'Recon only', planetId}
        });
        missionId = mission.id;
    });

    afterEach(async () => {
        await app.prisma.planet.deleteMany();
        await app.prisma.stormtrooper.deleteMany();
        vi.restoreAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /missions', () => {
        it('rejects without auth', async () => {
            const res = await app.inject({method: 'GET', url: '/missions'});

            expect(res.statusCode).toBe(401);
        });

        it('returns the list of missions', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: '/missions?page=1&limit=10',
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);
            const body = res.json();
            expect(body.total).toBe(1);
            expect(body.missions[0]).toMatchObject({title: 'Scout the base'});
        });
    });

    describe('GET /missions/:id', () => {
        it('returns a mission with its planet', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);
            const {mission} = res.json();
            expect(mission).toMatchObject({title: 'Scout the base'});
            expect(mission.planet).toMatchObject({name: 'Hoth'});
        });

        it('returns 404 for a missing mission', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: '/missions/999999',
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /missions/:id', () => {
        it('rejects a trooper rank', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'PATCH',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {isCompleted: true}
            });

            expect(res.statusCode).toBe(403);
        });

        it('updates the mission for a captain rank', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'PATCH',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {isCompleted: true}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().mission).toMatchObject({isCompleted: true});
        });

        it('does not queue an email when there are no emperors', async () => {
            const token = signAccessToken(app, UserRank.captain);

            await app.inject({
                method: 'PATCH',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {isCompleted: true}
            });

            expect(app.emailQueue.add).not.toHaveBeenCalled();
        });

        it('queues a mission-completed email to every emperor', async () => {
            const token = signAccessToken(app, UserRank.captain);
            const emperorStormtrooper = await app.prisma.stormtrooper.create({data: {callSign: 'Vader'}});
            const emperor = await app.prisma.user.create({
                data: {email: 'emperor@empire.com', rank: UserRank.emperor, stormtrooperId: emperorStormtrooper.id}
            });

            const res = await app.inject({
                method: 'PATCH',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {isCompleted: true}
            });

            expect(res.statusCode).toBe(200);
            expect(app.emailQueue.add).toHaveBeenCalledWith(
                'mission-completed',
                expect.objectContaining({to: emperor.email})
            );
        });
    });

    describe('DELETE /missions/:id', () => {
        it('deletes the mission for a captain rank', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'DELETE',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);

            const getRes = await app.inject({
                method: 'GET',
                url: `/missions/${missionId}`,
                headers: {authorization: `Bearer ${token}`}
            });
            expect(getRes.statusCode).toBe(404);
        });
    });

    describe('PUT /missions/:id/stormtroopers', () => {
        it('rejects without auth', async () => {
            const res = await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                payload: {stormtroopers: []}
            });

            expect(res.statusCode).toBe(401);
        });

        it('rejects insufficient rank', async () => {
            const token = signAccessToken(app, UserRank.trooper);
            const trooper = await app.prisma.stormtrooper.create({data: {callSign: 'TK-421'}});

            const res = await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: [trooper.id]}
            });

            expect(res.statusCode).toBe(403);
        });

        it('rejects an empty list', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: []}
            });

            expect(res.statusCode).toBe(400);
        });

        it('returns 404 for a missing mission', async () => {
            const token = signAccessToken(app, UserRank.captain);
            const trooper = await app.prisma.stormtrooper.create({data: {callSign: 'TK-421'}});

            const res = await app.inject({
                method: 'PUT',
                url: '/missions/999999/stormtroopers',
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: [trooper.id]}
            });

            expect(res.statusCode).toBe(404);
        });

        it('returns 404 for a missing stormtrooper', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: [999999]}
            });

            expect(res.statusCode).toBe(404);
        });

        it('assigns stormtroopers to the mission for a captain rank', async () => {
            const token = signAccessToken(app, UserRank.captain);
            const first = await app.prisma.stormtrooper.create({data: {callSign: 'TK-421'}});
            const second = await app.prisma.stormtrooper.create({data: {callSign: 'TK-422'}});

            const res = await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: [first.id, second.id]}
            });

            expect(res.statusCode).toBe(200);
            const {mission} = res.json();
            expect(mission.stormtroopers).toHaveLength(2);
            expect(mission.stormtroopers.map((s: {id: number}) => s.id).sort()).toEqual([first.id, second.id].sort());
        });

        it('replaces the previous assignment instead of appending to it', async () => {
            const token = signAccessToken(app, UserRank.captain);
            const first = await app.prisma.stormtrooper.create({data: {callSign: 'TK-421'}});
            const second = await app.prisma.stormtrooper.create({data: {callSign: 'TK-422'}});

            await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: [first.id]}
            });

            const res = await app.inject({
                method: 'PUT',
                url: `/missions/${missionId}/stormtroopers`,
                headers: {authorization: `Bearer ${token}`},
                payload: {stormtroopers: [second.id]}
            });

            expect(res.statusCode).toBe(200);
            const {mission} = res.json();
            expect(mission.stormtroopers).toHaveLength(1);
            expect(mission.stormtroopers[0].id).toBe(second.id);
        });
    });
});
