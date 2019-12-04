// @ts-check
import welcome from './welcome';
import sessions from './sessions';
import users from './users';
import statuses from './statuses';

const controllers = [welcome, sessions, users, statuses];

export default (router, container) => controllers.forEach(f => f(router, container));
