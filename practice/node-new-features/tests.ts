import {describe, test} from 'node:test';

describe('some user service', () => {
    test('should create user', async t => {
        const fetchMock = t.mock.fn(async () => ({id: 1, name: 'Bro'}));
        const res = await fetchMock();
        t.assert.equal(fetchMock.mock.callCount(), 1);
        t.assert.equal(res.name, 'Bro');
    });
});
