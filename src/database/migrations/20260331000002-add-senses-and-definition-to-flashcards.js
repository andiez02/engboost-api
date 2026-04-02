'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('flashcards');

    if (!tableInfo.definition) {
      await queryInterface.addColumn('flashcards', 'definition', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (!tableInfo.senses) {
      await queryInterface.addColumn('flashcards', 'senses', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('flashcards');
    if (tableInfo.definition) {
      await queryInterface.removeColumn('flashcards', 'definition');
    }
    if (tableInfo.senses) {
      await queryInterface.removeColumn('flashcards', 'senses');
    }
  }
};
