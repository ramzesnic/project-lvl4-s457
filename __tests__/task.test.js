import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import { Op } from 'sequelize';
import lib from './lib';

import {
  // @ts-ignore
  User, Status, Task, Tag, TaskTag,
} from '../models';

import app from '..';

const testStatuses = [
  { name: 'забыл' },
  { name: 'забил' },
];

describe('Task test', () => {
  let server;
  let authCookie;
  const fakerUserOne = lib.getFakeUser();
  const fakerUserTwo = lib.getFakeUser();
  beforeAll(async () => {
    expect.extend(matchers);
    await User.sync();
    await Status.sync();
    await Task.sync();
    await Tag.sync();
    await TaskTag.sync();
    await lib.createUser();
    await lib.createUser(fakerUserOne);
    await lib.createUser(fakerUserTwo);
    await Status.bulkCreate(testStatuses);
  });

  beforeEach(async () => {
    server = app().listen();
    authCookie = await lib.getTestUserCookie(server);
  });

  it('Create task', async () => {
    const executor = await User.findOne({ where: { email: fakerUserOne.email } });
    const status = await Status.findOne({ where: { name: testStatuses[0].name } });
    const fakeTask = lib.getFakeTask(executor.id, status.id);
    await request.agent(server)
      .post('/tasks/new')
      .set('Cookie', authCookie)
      .send({ form: { ...fakeTask } });
    const task = await Task.findOne({ where: { name: fakeTask.name } });
    expect(task).toBeTruthy();
  });

  it('Update task', async () => {
    const task = await Task.findOne();
    const tags = (await task.getTags()).join(';');
    const {
      id, description, assignedTo, status,
    } = task;
    // const newName = `${name}-${faker.lorem.word()}`;
    const newName = 'zzzzzzzzzzzzzzzzzzzzzzz';
    await request.agent(server)
      .patch(`/task/${id}/edit`)
      .set('Cookie', authCookie)
      .send({
        form: {
          name: newName,
          description,
          tags,
          status,
          assignedTo,
        },
      });
    const { name: taskName } = await Task.findOne();
    expect(taskName).toBe(newName);
  });

  it('Filter by status', async () => {
    const fakeName = 'fakeName999';
    const executorOne = await User.findOne({ where: { email: fakerUserOne.email } });
    const executorTwo = await User.findOne({ where: { email: fakerUserOne.email } });
    const statusOne = await Status.findOne({ where: { name: testStatuses[0].name } });
    const statusTwo = await Status.findOne({ where: { name: testStatuses[1].name } });
    const fakeTaskOne = lib.getFakeTask(executorOne.id, statusOne.id, executorOne.id);
    const fakeTaskTwo = lib.getFakeTask(executorTwo.id, statusTwo.id, executorTwo.id, fakeName);
    await lib.createTask(fakeTaskOne);
    await lib.createTask(fakeTaskTwo);

    const res = await request.agent(server)
      .get(`/tasks/all?status=${statusOne.id}`)
      .send();
    expect(res.text.includes(fakeTaskOne.name)).toBeTruthy();
    expect(res.text.includes(fakeTaskTwo.name)).toBeFalsy();
  });

  it('Filter by assignedTo', async () => {
    const userOne = await User.findOne({ where: { email: fakerUserOne.email } });
    const userTwo = await User.findOne({ where: { email: fakerUserTwo.email } });
    const res = await request.agent(server)
      .get(`/tasks/all?assignedTo=${userOne.id}`)
      .send();
    expect(res.text.includes(`<td>${userOne.fullName}</td>`)).toBeTruthy();
    expect(res.text.includes(`<td>${userTwo.fullName}</td>`)).toBeFalsy();
  });

  it('Filter by tag', async () => {
    const taskNameOne = 'uniqetasknzme4567238892dwe';
    const tagNameOne = 'uniqetagname56676623623';
    const taskNameTwo = 'uniqetasknzmeqqqqqqqqqqqqqqqqq';
    const tagNameTwo = 'uniqetagnameqqqqqqqqqqqqqqqqqqqq';
    const user = await User.findOne({ where: { email: fakerUserOne.email } });
    const status = await Status.findOne({ where: { name: testStatuses[0].name } });
    const rawtaskOne = lib.getFakeTask(user.id, status.id, user.id, taskNameOne);
    const rawtaskTwo = lib.getFakeTask(user.id, status.id, user.id, taskNameTwo);
    rawtaskOne.tags = tagNameOne;
    rawtaskTwo.tags = tagNameTwo;
    await lib.createTask(rawtaskOne);
    await lib.createTask(rawtaskTwo);
    const res = await request.agent(server)
      .get(`/tasks/all?tags=${tagNameOne}`)
      .send();
    expect(res.text.includes(taskNameOne)).toBeTruthy();
    expect(res.text.includes(taskNameTwo)).toBeFalsy();
  });

  it('Filter by my task', async () => {
    const taskName = 'zzzzzzzzzzzzzzzzzzzzzzz';
    const tasks = await Task.findAll({
      where: {
        name: {
          [Op.not]: taskName,
        },
      },
    });
    const taskNames = tasks.map(name => name);
    const res = await request.agent(server)
      .get('/tasks/all?self=on')
      .set('Cookie', authCookie)
      .send();
    expect(res.text.includes(taskName)).toBeTruthy();
    taskNames.forEach(async (name) => {
      const { text } = await request.agent(server)
        .get('/tasks/all?self=on')
        .set('Cookie', authCookie)
        .send();
      expect(text.includes(name)).toBeFalsy();
    });
  });

  it('Delete task', async () => {
    const taskName = 'zzzzzzzzzzzzzzzzzzzzzzz';
    const { id } = await Task.findOne({ where: { name: taskName } });
    await request.agent(server)
      .delete(`/task/${id}`)
      .set('Cookie', authCookie)
      .send();
    const task = await Task.findByPk(id);
    expect(task).toBeFalsy();
  });
});
