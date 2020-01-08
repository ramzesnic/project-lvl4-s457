import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import lib from './lib';

// @ts-ignore
import { User, Status } from '../models';

import app from '..';

const testStatuses = {
  new: 'забыл',
  changed: 'забил',
};

describe('Status test', () => {
  let server;
  let authCookie;
  beforeAll(async () => {
    expect.extend(matchers);
    await User.sync();
    await Status.sync();
    await lib.createUser();
  });

  beforeEach(async () => {
    server = app().listen();
    authCookie = await lib.getTestUserCookie(server);
  });

  it('Create status', async () => {
    const name = testStatuses.new;
    const res = await request.agent(server)
      .post('/status/new')
      .set('Cookie', authCookie)
      .send({ form: { name } });

    const newStatus = await Status.findOne({
      where: {
        name,
      },
    });
    // @ts-ignore
    expect(res).toHaveHTTPStatus(302);
    expect(newStatus).toBeTruthy();
  });

  it('Create status failed', async () => {
    const name = testStatuses.new;
    const res = await request.agent(server)
      .post('/status/new')
      .send({ form: { name } });

    // @ts-ignore
    expect(res).toHaveHTTPStatus(401);
  });

  it('Update status', async () => {
    const status = await Status.findOne({
      where: {
        name: testStatuses.new,
      },
    });
    const { id } = status;
    const name = testStatuses.changed;

    await request.agent(server)
      .patch(`/status/${id}`)
      .set('Cookie', authCookie)
      .send({ form: { name } });

    const newStatus = await Status.findByPk(id);
    expect(newStatus.name).toBe(name);
  });

  it('Delete status', async () => {
    const status = await Status.findOne({
      where: {
        name: testStatuses.changed,
      },
    });
    const { id } = status;

    await request.agent(server)
      .delete(`/status/${id}`)
      .set('Cookie', authCookie);

    const newStatus = await Status.findByPk(id);
    expect(newStatus).toBeFalsy();
  });

  afterEach((done) => {
    server.close();
    done();
  });
  afterAll((done) => {
    server.close();
    done();
  });
});
