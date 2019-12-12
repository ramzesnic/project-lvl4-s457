import buildFormObj from '../lib/formObjectBuilder';
import checkAuth from '../lib/checkAuth';
// @ts-ignore
import { Status } from '../models';


export default (router, container) => {
  const { logger } = container;
  router
    .get('statusAll', '/status/all', async (ctx) => {
      const statuses = await Status.findAll();
      ctx.render('status', { statuses });
    })
    .delete('status', '/status/:id', checkAuth, async (ctx) => {
      const { id } = ctx.params;
      const status = await Status.findByPk(id);
      logger(status);
      try {
        status.destroy();
        ctx.flash.set('Сатус удален');
        ctx.redirect(router.url('statusAll'));
      } catch (e) {
        ctx.flash.set('Ошибка удаления статуса');
        ctx.redirect(router.url('statusAll'));
      }
    })
    .get('newStatus', '/status/new', async (ctx) => {
      const status = {};
      const method = 'post';
      ctx.render('status/new', { f: buildFormObj(status), method });
    })
    .post('newStatus', '/status/new', checkAuth, async (ctx) => {
      const { request: { body: { form } } } = ctx;
      const status = Status.build(form);
      try {
        await status.save();
        ctx.flash.set('Статус сохранен');
        ctx.redirect(router.url('statusAll'));
      } catch (e) {
        const method = 'post';
        ctx.render('status/new', { f: buildFormObj(status, e), method });
      }
    })
    .get('status', '/status/:id', async (ctx) => {
      const { id } = ctx.params;
      const status = await Status.findByPk(id);
      const method = 'patch';
      ctx.render('status/new', { f: buildFormObj(status), id, method });
    })
    .patch('status', '/status/:id', checkAuth, async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;
      const status = await Status.findByPk(id);
      try {
        await status.update(form);
        ctx.flash.set('Статус обновлен');
        ctx.redirect(router.url('statusAll'));
      } catch (e) {
        const method = 'path';
        ctx.render('status/new', { f: buildFormObj(status, e), id, method });
      }
    });
};
