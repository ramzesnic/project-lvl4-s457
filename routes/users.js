// @ts-check
import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../models';

export default (router, container) => {
  const { logger } = container;
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
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        logger('Error %j', e);
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('userSettings', '/users/settings', async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('users/settings', { f: buildFormObj(user) });
    })
    .patch('userSettings', '/users/settings', async (ctx) => {
      const { request: { body: { form } } } = ctx;
      try {
        const { userId } = ctx.session;
        const user = await User.findByPk(userId);
        await user.update(form);
        ctx.flash.set('Пользователь обновлен');
        ctx.redirect(router.url('userSettings'));
      } catch (e) {
        ctx.flash.set('Ошибка редактирования пользователя');
        ctx.redirect(router.url('root'));
      }
    })
    .delete('userSettings', '/users/settings', async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      try {
        user.destroy();
        ctx.session = {};
        ctx.flash.set('Пользователь удален');
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.flash.set('Ошибка удаления пользователя');
        ctx.redirect(router.url('userSettings'));
      }
    });
};
