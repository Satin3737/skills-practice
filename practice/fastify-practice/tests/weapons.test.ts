import type {FastifyInstance} from 'fastify';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {UserRank} from '@/database/prisma/enums';
import {buildTestApp} from './helpers/build-app';
import {signAccessToken} from './helpers/jwt';

describe('weapons', () => {
    let app: FastifyInstance;
    let weaponId: number;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    beforeEach(async () => {
        const weapon = await app.prisma.weapon.create({data: {mark: 'E-11', damage: 50}});
        weaponId = weapon.id;
    });

    afterEach(async () => {
        await app.prisma.weapon.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('auth guard', () => {
        it('rejects any request without a token', async () => {
            const res = await app.inject({method: 'GET', url: '/weapons'});

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /weapons', () => {
        it('returns the list of weapons', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: '/weapons?page=1&limit=10',
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);
            const body = res.json();
            expect(body.total).toBe(1);
            expect(body.weapons[0]).toMatchObject({mark: 'E-11', damage: 50});
        });
    });

    describe('POST /weapons', () => {
        it('creates a weapon for a trooper rank', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'POST',
                url: '/weapons',
                headers: {authorization: `Bearer ${token}`},
                payload: {mark: 'DLT-19', damage: 80, isDeadly: true}
            });

            expect(res.statusCode).toBe(201);
            expect(res.json().weapon).toMatchObject({mark: 'DLT-19', damage: 80, isDeadly: true});
        });
    });

    describe('GET /weapons/:id', () => {
        it('returns a single weapon', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: `/weapons/${weaponId}`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().weapon).toMatchObject({mark: 'E-11'});
        });

        it('returns 404 for a missing weapon', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'GET',
                url: '/weapons/999999',
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /weapons/:id', () => {
        it('updates a weapon', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'PATCH',
                url: `/weapons/${weaponId}`,
                headers: {authorization: `Bearer ${token}`},
                payload: {damage: 75}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().weapon).toMatchObject({damage: 75});
        });
    });

    describe('DELETE /weapons/:id', () => {
        it('deletes a weapon', async () => {
            const token = signAccessToken(app, UserRank.trooper);

            const res = await app.inject({
                method: 'DELETE',
                url: `/weapons/${weaponId}`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);

            const getRes = await app.inject({
                method: 'GET',
                url: `/weapons/${weaponId}`,
                headers: {authorization: `Bearer ${token}`}
            });
            expect(getRes.statusCode).toBe(404);
        });
    });
});
