'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('folders', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING(50)),
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('folders', 'tags');
  },
};
