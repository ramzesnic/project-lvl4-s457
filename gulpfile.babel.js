import gulp from 'gulp';
import repl from 'repl';
import getServer from '.';
import container from './container';

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 4000, cb);
});

gulp.task('console', () => {
  // gutil.log = gutil.noop;
  process.env.NODE_OPTIONS = '--experimental-repl-await';
  const replServer = repl.start({
    prompt: 'Application console > ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});
