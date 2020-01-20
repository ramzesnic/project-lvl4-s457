export default async (ctx, next) => {
  if (!ctx.session.userId) {
    ctx.throw(401, ctx.t('flash.access_denied'));
  }
  await next();
};
