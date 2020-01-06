import { encrypt } from '../lib/secure';
import { formatedDate as getLocalDate } from '../lib/helpers';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value); // нужно для валидации
      },
      validate: {
        len: [1, +Infinity],
      },
    },
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      formatedDate() {
        return getLocalDate(this);
      },
    },
  });
  User.associate = (models) => {
    User.hasMany(models.Task, { as: 'CreatorTask', foreignKey: 'creator' });
    User.hasMany(models.Task, { as: 'UserTask', foreignKey: 'assignedTo' });
  };
  return User;
};
