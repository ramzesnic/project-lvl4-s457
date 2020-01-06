module.exports = (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    taskId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER,
  }, {});
  return TaskTag;
};
