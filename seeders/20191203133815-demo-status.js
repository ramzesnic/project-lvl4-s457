module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Statuses', [
    {
      name: 'новый',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'в работе',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'на тесторовании',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'завершен',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ], {}),

  down: queryInterface => queryInterface.bulkDelete('Statuses', null, {}),
};
