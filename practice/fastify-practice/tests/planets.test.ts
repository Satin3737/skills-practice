import type {FastifyInstance} from 'fastify';
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';
import {UserRank} from '@/database/prisma/enums';
import {buildTestApp} from './helpers/build-app';
import {signAccessToken} from './helpers/jwt';

describe('planets', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterEach(async () => {
        await app.prisma.planet.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /planets', () => {
        it('returns an empty paginated list', async () => {
            const res = await app.inject({method: 'GET', url: '/planets?page=1&limit=10'});

            expect(res.statusCode).toBe(200);
            expect(res.json()).toEqual({planets: [], total: 0});
        });

        it('returns created planets', async () => {
            await app.prisma.planet.create({data: {name: 'Tatooine', size: 10465, type: 'exoplanet'}});

            const res = await app.inject({method: 'GET', url: '/planets?page=1&limit=10'});

            expect(res.statusCode).toBe(200);
            const body = res.json();
            expect(body.total).toBe(1);
            expect(body.planets[0]).toMatchObject({name: 'Tatooine', size: 10465});
        });
    });

    describe('POST /planets', () => {
        it('rejects without auth', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/planets',
                payload: {name: 'Hoth', size: 7200, type: 'exoplanet'}
            });

            expect(res.statusCode).toBe(401);
        });

        it('rejects insufficient rank', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'POST',
                url: '/planets',
                headers: {authorization: `Bearer ${token}`},
                payload: {name: 'Hoth', size: 7200, type: 'exoplanet'}
            });

            expect(res.statusCode).toBe(403);
        });

        it('creates a planet for emperor rank', async () => {
            const token = signAccessToken(app, UserRank.emperor);

            const res = await app.inject({
                method: 'POST',
                url: '/planets',
                headers: {authorization: `Bearer ${token}`},
                payload: {name: 'Hoth', size: 7200, type: 'exoplanet'}
            });

            expect(res.statusCode).toBe(201);
            expect(res.json().planet).toMatchObject({name: 'Hoth', size: 7200, type: 'exoplanet'});
        });
    });

    describe('GET /planets/:id', () => {
        it('returns a single planet', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Endor', size: 4900, type: 'exoplanet'}});

            const res = await app.inject({method: 'GET', url: `/planets/${planet.id}`});

            expect(res.statusCode).toBe(200);
            expect(res.json().planet).toMatchObject({name: 'Endor'});
        });

        it('returns 404 for a missing planet', async () => {
            const res = await app.inject({method: 'GET', url: '/planets/999999'});

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /planets/:id', () => {
        it('rejects insufficient rank', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Naboo', size: 12120, type: 'exoplanet'}});
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'PATCH',
                url: `/planets/${planet.id}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {name: 'Naboo Prime'}
            });

            expect(res.statusCode).toBe(403);
        });

        it('updates a planet for emperor rank', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Naboo', size: 12120, type: 'exoplanet'}});
            const token = signAccessToken(app, UserRank.emperor);

            const res = await app.inject({
                method: 'PATCH',
                url: `/planets/${planet.id}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {name: 'Naboo Prime'}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().planet).toMatchObject({name: 'Naboo Prime'});
        });
    });

    describe('DELETE /planets/:id', () => {
        it('deletes a planet for emperor rank', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Alderaan', size: 12500, type: 'exoplanet'}});
            const token = signAccessToken(app, UserRank.emperor);

            const res = await app.inject({
                method: 'DELETE',
                url: `/planets/${planet.id}`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);

            const getRes = await app.inject({method: 'GET', url: `/planets/${planet.id}`});
            expect(getRes.statusCode).toBe(404);
        });
    });

    describe('GET /planets/:id/missions', () => {
        it('rejects without auth', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Hoth', size: 7200, type: 'exoplanet'}});

            const res = await app.inject({method: 'GET', url: `/planets/${planet.id}/missions`});

            expect(res.statusCode).toBe(401);
        });

        it('returns missions for the planet', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Hoth', size: 7200, type: 'exoplanet'}});
            await app.prisma.mission.create({data: {title: 'Scout the base', planetId: planet.id}});
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: `/planets/${planet.id}/missions?page=1&limit=10`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);
            const body = res.json();
            expect(body.total).toBe(1);
            expect(body.missions[0]).toMatchObject({title: 'Scout the base'});
        });
    });

    describe('POST /planets/:id/missions', () => {
        it('rejects insufficient rank', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Hoth', size: 7200, type: 'exoplanet'}});
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'POST',
                url: `/planets/${planet.id}/missions`,
                headers: {authorization: `Bearer ${token}`},
                payload: [{title: 'Scout the base'}]
            });

            expect(res.statusCode).toBe(403);
        });

        it('creates missions for the planet for a captain rank', async () => {
            const planet = await app.prisma.planet.create({data: {name: 'Hoth', size: 7200, type: 'exoplanet'}});
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'POST',
                url: `/planets/${planet.id}/missions`,
                headers: {authorization: `Bearer ${token}`},
                payload: [{title: 'Scout the base'}, {title: 'Destroy the shield generator'}]
            });

            expect(res.statusCode).toBe(201);
            expect(res.json().missions).toHaveLength(2);
        });
    });
});
