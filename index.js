import _ from 'lodash';
import path from 'path';
import Koa from 'koa';
import koaLogger from 'koa-logger';
import Router from 'koa-router';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import serve from 'koa-static';
import Pug from 'koa-pug';
import koaWebpack from 'koa-webpack';
import bodyParser from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import Rollbar from 'rollbar';
import webpackConfig from './webpack.config';
import locales from './lib/locales';
import container from './container';
import addRoutes from './routes';

export default () => {
  const app = new Koa();
  app.use(koaLogger());
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBACK_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.keys = ['my app key'];
  // @ts-ignore
  app.use(session(app));
  app.use(locales);
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isActiveUrl: currentUrl => currentUrl === ctx.url,
      isSignedIn: () => ctx.session.userId !== undefined,
      t: ctx.t,
    };
    await next();
  });
  app.use(bodyParser());
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }, { methods: ['POST', 'GET'] }));
  app.use(serve(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    koaWebpack({
      // @ts-ignore
      config: webpackConfig,
    }).then(m => app.use(m));
  }

  const router = new Router();
  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      // @ts-ignore
      { urlFor: (...args) => router.url(...args) },
    ],
  });
  // @ts-ignore
  pug.use(app);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  });

  return app;
};
