import welcome from './welcome';
import sessions from './sessions';
import users from './users';
import statuses from './statuses';
import tasks from './tasks';

const controllers = [welcome, sessions, users, statuses, tasks];

export default (router, container) => controllers.forEach(f => f(router, container));
