import request from 'supertest';
import faker from 'faker';

// @ts-ignore
import { User } from '../../models';

jest.useFakeTimers();
jest.setTimeout(30000);

const testUser = {
  email: 'test@test.com',
  password: 'test',
  firstName: 'test',
  lastName: 'test',
};

const getFakeUser = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

const createUser = async () => {
  const user = User.build(testUser);
  await user.save();
};

const signIn = async (server, form) => {
  const res = await request.agent(server)
    .post('/session')
    .send({
      form,
    });
  return res;
};

const getAuthCookie = res => res.headers['set-cookie'];

const getTestUserCookie = async server => getAuthCookie(await signIn(server, testUser));

export default {
  getFakeUser, signIn, getAuthCookie, createUser, getTestUserCookie,
};
