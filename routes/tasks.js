export default (router, container) => {
  router.get('tasksAll', '/tasks/all', async (ctx) => {
    ctx.render('welcome');
  });
};
