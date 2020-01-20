// import buildFormObj from '../lib/formObjectBuilder';
// @ts-ignore

export default (router, container) => {
  const { User } = container.models;
  const { buildFormObj, logger } = container.lib;
  router
    .get('newUser', '/users/new', async (ctx) => {
      const user = {};
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .post('users', '/users', async (ctx) => {
      const { request: { body: { form } } } = ctx;
      logger('Form %j', form);
      const user = User.build(form);
      logger('User %j', user);
      try {
        await user.save();
        ctx.flash.set(ctx.t('flash.created.user'));
        ctx.redirect(router.url('root'));
      } catch (e) {
        logger('Error %j', e);
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('userSettings', '/users/settings', async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      if (!user) {
        ctx.throw(401, ctx.t('flash.access_denied'));
      }
      ctx.render('users/settings', { f: buildFormObj(user) });
    })
    .patch('userSettings', '/users/settings', async (ctx) => {
      const { request: { body: { form } } } = ctx;
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      if (!user) {
        ctx.throw(401, ctx.t('flash.access_denied'));
      }
      try {
        await user.update(form);
        ctx.flash.set(ctx.t('flash.updated.user'));
        ctx.redirect(router.url('userSettings'));
      } catch (e) {
        ctx.render('users/settings', { f: buildFormObj(user, e) });
      }
    })
    .delete('userSettings', '/users/settings', async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      if (!user) {
        ctx.throw(401, ctx.t('flash.access_denied'));
      }
      try {
        user.destroy();
        ctx.session = {};
        ctx.flash.set(ctx.t('flash.delete.ok.user'));
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.flash.set(ctx.t('flash.delete.fail.user'));
        ctx.redirect(router.url('userSettings'));
      }
    });
};
