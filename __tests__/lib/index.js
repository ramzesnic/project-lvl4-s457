import request from 'supertest';
import faker from 'faker';
import lib from '../../lib';

// @ts-ignore
import { User, Task, Tag } from '../../models';

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

const getFakeTask = (assignedTo, status, creator, taskName) => ({
  name: taskName || faker.lorem.word(),
  description: faker.lorem.text(),
  tags: faker.lorem.words().split(' ').join(';'),
  assignedTo,
  status,
  creator,
});

const createUser = async (fakerUser = testUser) => {
  const user = User.build(fakerUser);
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

const createTask = async (rawTask) => {
  const tagsArray = lib.getTagsArray(rawTask.tags);
  const tagsObj = lib.getTagsObject(tagsArray);
  await Tag.bulkCreate(tagsObj, { ignoreDuplicates: true });
  const tags = await Tag.findAll({ where: { name: tagsArray } });
  const task = await Task.create(rawTask);
  await task.setTags(tags);
  return task;
};

export default {
  getFakeUser, signIn, getAuthCookie, createUser, getTestUserCookie, getFakeTask, createTask,
};
