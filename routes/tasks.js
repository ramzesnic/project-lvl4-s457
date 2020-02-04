export default (router, container) => {
  const {
    Task, User, Status, Tag,
  } = container.models;
  const {
    buildFormObj,
    logger, filter, checkAuth, getTagsArray, getTagsObject, getStatusesData, getExecutorsData,
  } = container.lib;
  router
    .get('tasksAll', '/tasks/all', async (ctx) => {
      const executors = await User.findAll();
      const statuses = await Status.findAll();
      const scopes = filter(ctx);
      ctx.state.filter = ctx.query;
      logger('Filter %j', scopes);
      const tasks = await Task.scope(['defaultScope', ...scopes])
        .findAll();
      logger(tasks);
      const filtersOptions = { executors, statuses };
      ctx.render('tasks', { tasks, filtersOptions });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      const { userId: creator } = ctx.session;
      const statusId = (await Status.findOne()).id;
      const defaults = { statusId, executorId: creator };
      const method = 'post';
      const executors = getExecutorsData(await User.findAll());
      const statuses = getStatusesData(await Status.findAll());
      const task = { creator, assignedTo: executors, status: statuses };
      ctx.render('tasks/new', { f: buildFormObj(task), method, defaults });
    })
    .post('newTask', '/tasks/new', checkAuth, async (ctx) => {
      const { request: { body: { form } } } = ctx;
      const rawTagsArray = getTagsArray(form.tags);
      const rawTags = getTagsObject(rawTagsArray);
      const { userId: creator } = ctx.session;
      form.creator = creator;
      const task = Task.build(form);
      try {
        await task.save();
        await Tag.bulkCreate(rawTags, { updateOnDuplicate: ['updatedAt'], include: [Task] });
        const tags = await Tag.findAll({ where: { name: rawTagsArray } });
        logger('TAGS: %j', tags);
        await task.setTags(tags);
        ctx.flash.set(ctx.t('flash.created.task'));
        ctx.redirect(router.url('tasksAll'));
      } catch (e) {
        const method = 'post';
        ctx.render('tasks/new', { f: buildFormObj(task, e), method });
      }
    })
    .get('task', '/task/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      const tags = await task.getTags();
      const rawTags = tags.map(tag => tag.name).join('; ');
      ctx.render('tasks/show', { task, rawTags });
    })
    .get('editTask', '/task/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const method = 'patch';
      const executors = getExecutorsData(await User.findAll());
      const statuses = getStatusesData(await Status.findAll());
      const task = await Task.findByPk(id);
      const defaults = {
        statusId: task.Status.id, executorId: task.Executor ? task.Executor.id : null,
      };
      const tags = await task.getTags();
      const rawTags = tags.map(tag => tag.name).join('; ');
      const rawTask = {
        creator: id,
        assignedTo: executors,
        status: statuses,
        tags: rawTags,
        name: task.name,
        description: task.description,
      };
      logger('description %j', buildFormObj(rawTask));
      ctx.render('tasks/new', {
        f: buildFormObj(rawTask), id, method, defaults,
      });
    })
    .patch('editTask', '/task/:id/edit', checkAuth, async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;
      const rawTagsArray = getTagsArray(form.tags);
      const rawTags = getTagsObject(rawTagsArray);
      const task = await Task.findByPk(id);
      task.name = form.name;
      task.description = form.description;
      try {
        await task.save();
        await task.setExecutor(form.assignedTo);
        await task.setStatus(form.status);
        await Tag.bulkCreate(rawTags, { updateOnDuplicate: ['updatedAt'], include: [Task] });
        const tags = await Tag.findAll({ where: { name: rawTagsArray } });
        await task.setTags(tags);
        ctx.flash.set(ctx.t('flash.updated.task'));
        ctx.redirect(router.url('tasksAll'));
      } catch (e) {
        const defaults = { statusId: form.status, executorId: form.assignedTo };
        const method = 'patch';
        ctx.render('tasks/edit', { f: buildFormObj(task, e), method, defaults });
      }
    })
    .delete('task', '/task/:id', checkAuth, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      try {
        await task.setTags([]); // cascade deleting not work
        await task.destroy();
        ctx.flash.set(ctx.t('flash.delete.ok.task'));
        ctx.redirect(router.url('tasksAll'));
      } catch (e) {
        ctx.flash.set(ctx.t('flash.delete.fail.task'));
        ctx.redirect(router.url('tasksAll'));
      }
    });
};
