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
    });
};
