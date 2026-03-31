'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'streak', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'last_study_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('users', 'daily_goal', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 20,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'daily_goal');
    await queryInterface.removeColumn('users', 'last_study_date');
    await queryInterface.removeColumn('users', 'streak');
  }
};
