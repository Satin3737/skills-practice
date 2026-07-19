import type {FastifyInstance} from 'fastify';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {UserRank} from '@/database/prisma/enums';
import {buildTestApp} from './helpers/build-app';
import {signAccessToken} from './helpers/jwt';

describe('stormtroopers', () => {
    let app: FastifyInstance;
    let stormtrooperId: number;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    beforeEach(async () => {
        const stormtrooper = await app.prisma.stormtrooper.create({data: {callSign: 'TK-421'}});
        stormtrooperId = stormtrooper.id;
    });

    afterEach(async () => {
        await app.prisma.weapon.deleteMany();
        await app.prisma.stormtrooper.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /stormtroopers', () => {
        it('returns the list of stormtroopers', async () => {
            const res = await app.inject({method: 'GET', url: '/stormtroopers?page=1&limit=10'});

            expect(res.statusCode).toBe(200);
            const body = res.json();
            expect(body.total).toBe(1);
            expect(body.stormtroopers[0]).toMatchObject({callSign: 'TK-421'});
        });
    });

    describe('POST /stormtroopers', () => {
        it('rejects an insufficient rank', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'POST',
                url: '/stormtroopers',
                headers: {authorization: `Bearer ${token}`},
                payload: {callSign: 'TK-422'}
            });

            expect(res.statusCode).toBe(403);
        });

        it('creates a stormtrooper for a captain rank', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'POST',
                url: '/stormtroopers',
                headers: {authorization: `Bearer ${token}`},
                payload: {callSign: 'TK-422'}
            });

            expect(res.statusCode).toBe(201);
            expect(res.json().stormtrooper).toMatchObject({callSign: 'TK-422'});
        });
    });

    describe('GET /stormtroopers/:id', () => {
        it('returns a single stormtrooper', async () => {
            const res = await app.inject({method: 'GET', url: `/stormtroopers/${stormtrooperId}`});

            expect(res.statusCode).toBe(200);
            expect(res.json().stormtrooper).toMatchObject({callSign: 'TK-421'});
        });

        it('returns 404 for a missing stormtrooper', async () => {
            const res = await app.inject({method: 'GET', url: '/stormtroopers/999999'});

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /stormtroopers/:id', () => {
        it('updates the call sign for a captain rank', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'PATCH',
                url: `/stormtroopers/${stormtrooperId}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {callSign: 'TK-999'}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().stormtrooper).toMatchObject({callSign: 'TK-999'});
        });
    });

    describe('DELETE /stormtroopers/:id', () => {
        it('deletes the stormtrooper for a captain rank', async () => {
            const token = signAccessToken(app, UserRank.captain);

            const res = await app.inject({
                method: 'DELETE',
                url: `/stormtroopers/${stormtrooperId}`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);

            const getRes = await app.inject({method: 'GET', url: `/stormtroopers/${stormtrooperId}`});
            expect(getRes.statusCode).toBe(404);
        });
    });

    describe('weapon assignment', () => {
        it('assigns and unassigns a weapon', async () => {
            const token = signAccessToken(app, UserRank.trooper);
            const weapon = await app.prisma.weapon.create({data: {mark: 'E-11', damage: 50}});

            const assignRes = await app.inject({
                method: 'PUT',
                url: `/stormtroopers/${stormtrooperId}/weapons/${weapon.id}`,
                headers: {authorization: `Bearer ${token}`}
            });
            expect(assignRes.statusCode).toBe(200);

            const listRes = await app.inject({
                method: 'GET',
                url: `/stormtroopers/${stormtrooperId}/weapons?page=1&limit=10`,
                headers: {authorization: `Bearer ${token}`}
            });
            expect(listRes.json().total).toBe(1);

            const unassignRes = await app.inject({
                method: 'DELETE',
                url: `/stormtroopers/${stormtrooperId}/weapons/${weapon.id}`,
                headers: {authorization: `Bearer ${token}`}
            });
            expect(unassignRes.statusCode).toBe(200);

            const listAfterRes = await app.inject({
                method: 'GET',
                url: `/stormtroopers/${stormtrooperId}/weapons?page=1&limit=10`,
                headers: {authorization: `Bearer ${token}`}
            });
            expect(listAfterRes.json().total).toBe(0);
        });

        it('rejects weapon endpoints without auth', async () => {
            const res = await app.inject({method: 'GET', url: `/stormtroopers/${stormtrooperId}/weapons`});

            expect(res.statusCode).toBe(401);
        });
    });
});
