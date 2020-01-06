export default (sequelize, DataTypes) => {
  const Status = sequelize.define('Status', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  }, {});
  Status.associate = (models) => {
    Status.hasMany(models.Task, { foreignKey: 'status' });
  };
  return Status;
};
