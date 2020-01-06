import { Op } from 'sequelize';
import { formatedDate as getLocalDate } from '../lib/helpers';

export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    description: DataTypes.STRING,
    status: DataTypes.INTEGER,
    creator: DataTypes.INTEGER,
    assignedTo: DataTypes.INTEGER,
  }, {
    getterMethods: {
      formatedDate() {
        return getLocalDate(this);
      },
    },
    scopes: {
      byCreator: id => ({
        where: {
          creator: id,
        },
      }),
      byExecutor: id => ({
        where: {
          assignedTo: id,
        },
      }),
      byStatus: id => ({
        where: {
          status: id,
        },
      }),
    },
  });
  Task.associate = (models) => {
    Task.belongsTo(models.Status, { foreignKey: 'status' });
    Task.belongsTo(models.User, { as: 'Creator', foreignKey: 'creator' });
    Task.belongsTo(models.User, { as: 'Executor', foreignKey: 'assignedTo' });
    Task.belongsToMany(models.Tag, { through: 'TaskTag', foreignKey: 'taskId', onDelete: 'cascade' });
    Task.addScope('defaultScope', {
      include: [
        {
          model: models.Status,
          options: { plain: false },
        },
        {
          model: models.User,
          as: 'Creator',
        },
        {
          model: models.User,
          as: 'Executor',
        }],
    });
    Task.addScope('byTags', tags => ({
      include: [
        {
          model: models.Tag,
          where: {
            name: {
              [Op.in]: tags,
            },
          },
        },
      ],
    }));
  };
  return Task;
};
