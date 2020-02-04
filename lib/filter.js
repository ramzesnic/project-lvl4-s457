import _ from 'lodash';
import { getTagsArray } from './helpers';
import logger from './logger';

export default (ctx) => {
  const getScope = (name, value) => ({ method: [`by${_.upperFirst(name)}`, value] });
  const scopes = [
    {
      name: 'tags',
      scope: (name, value) => getScope(name, getTagsArray(value)),
    },
    {
      name: 'status',
      scope: (name, value) => getScope(name, value),
    },
    {
      name: 'executor',
      scope: (name, value) => getScope(name, value),
    },
    {
      name: 'creator',
      scope: name => getScope(name, ctx.session.userId),
    },
  ];
  const { query } = ctx;
  logger('Filter query %j', query);
  return Object.keys(query)
    .filter(name => query[name] !== '')
    .map((name) => {
      const value = query[name];
      const { scope } = scopes.find(item => item.name === name);
      return scope(name, value);
    })
    // .filter(scope => scope);
};
