// import buildFormObj from '../lib/formObjectBuilder';
// import { encrypt } from '../lib/secure';
// @ts-ignore

export default (router, container) => {
  const { User } = container.models;
  const { encrypt, buildFormObj, logger } = container.lib;
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }
      logger('email or password were wrong %j', user);
      ctx.flash.set(ctx.t('flash.auth_fail'));
      ctx.redirect(router.url('newSession'));
    })
    .delete('session', '/session', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
