import path from 'path';
import i18next from 'i18next';
import Backend from 'i18next-sync-fs-backend';
import koaI18next from 'koa-i18next';
import log from './logger';

// @ts-ignore
i18next.use(Backend)
  .init({
    backend: {
      loadPath: path.resolve('./config/locales/{{lng}}/{{ns}}.json'),
      addPath: path.resolve('./config/locales/{{lng}}/{{ns}}.missing.json'),
    },
    preload: ['en'],
    fallbackLng: 'en',
  });

i18next.on('loaded', (loaded) => {
  log('loaded resource', loaded);
  log('test i18 %s', i18next.t('test'));
  log('exist? %s', i18next.exists('test'));
});

export default koaI18next(i18next);
