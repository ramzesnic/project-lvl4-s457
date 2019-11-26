import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import { User } from '../models';

import app from '..';

jest.useFakeTimers();
jest.setTimeout(30000);

const getFakeUser = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

const signIn = async (server, form) => {
  const res = await request.agent(server)
    .post('/session')
    .send({
      form,
    });
  return res;
};

const getAuthCookie = res => res.headers['set-cookie'];

describe('requests', () => {
  let server;

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});

describe('Test user', () => {
  let server;
  const fUser = getFakeUser();
  beforeAll(async () => {
    await User.sync();
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('Create user', async () => {
    const { email } = fUser;
    await request.agent(server)
      .post('/users')
      .send({
        form: fUser,
      });
    const user = await User.findOne({
      where: {
        email,
      },
    });
    expect(user).toBeTruthy();
  });

  it('Get users', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
    expect(res.text.includes(fUser.email)).toBeTruthy();
  });

  it('Sign in', async () => {
    const res = await signIn(server, fUser);
    expect(res.headers.location).toBe('/');
  });

  it('Sign out', async () => {
    await signIn(server, fUser);
    await request.agent(server)
      .delete('/session')
      .expect(302);
  });

  it('Sign in error', async () => {
    const fakeData = {
      email: 'fake@email.com',
      password: 'fakepassword',
    };
    const res = await signIn(server, fakeData);
    expect(res.headers.location === '/').toBeFalsy();
  });

  it('Get user data', async () => {
    const { email } = fUser;
    const signedUserResponse = await signIn(server, fUser);
    const authCookie = getAuthCookie(signedUserResponse);
    const res = await request.agent(server)
      .get('/users/settings')
      .set('Cookie', authCookie);
    expect(res.text.includes(email)).toBeTruthy();
  });

  it('Update user', async () => {
    const { email } = fUser;
    const { id } = await User.findOne({
      where: {
        email,
      },
    });
    const newUserData = getFakeUser();
    const signedUserResponse = await signIn(server, fUser);
    const authCookie = getAuthCookie(signedUserResponse);
    await request.agent(server)
      .patch('/users/settings')
      .set('Cookie', authCookie)
      .send({
        form: newUserData,
      });
    const updatedUser = await User.findByPk(id);
    expect(updatedUser.email).toBe(newUserData.email);
  });

  it('Delete user', async () => {
    const { email } = fUser;
    const signedUserResponse = await signIn(server, fUser);
    const authCookie = getAuthCookie(signedUserResponse);
    await request.agent(server)
      .delete('/users/settings')
      .set('Cookie', authCookie);
    const user = await User.findOne({
      where: {
        email,
      },
    });
    expect(user).toBeFalsy();
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
