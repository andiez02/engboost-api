'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('flashcards');
    
    if (!tableInfo.pos) {
      await queryInterface.addColumn('flashcards', 'pos', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }
    
    if (!tableInfo.example) {
      await queryInterface.addColumn('flashcards', 'example', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('flashcards');
    if (tableInfo.pos) {
      await queryInterface.removeColumn('flashcards', 'pos');
    }
    if (tableInfo.example) {
      await queryInterface.removeColumn('flashcards', 'example');
    }
  }
};
