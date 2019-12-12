export default async (ctx, next) => {
  if (!ctx.session.userId) {
    ctx.throw(401, 'Доступ запрещен');
  }
  await next();
};
