'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make vietnamese nullable
    await queryInterface.changeColumn('flashcards', 'vietnamese', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
    
    // Make senses NOT NULL
    await queryInterface.changeColumn('flashcards', 'senses', {
      type: Sequelize.JSONB,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert senses to nullable
    await queryInterface.changeColumn('flashcards', 'senses', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Revert vietnamese to NOT NULL. Need to ensure no nulls exist first during rollback.
    // If there are nulls, they must be set to empty string or derived before reverting.
    await queryInterface.sequelize.query('UPDATE flashcards SET vietnamese = \'—\' WHERE vietnamese IS NULL');
    
    await queryInterface.changeColumn('flashcards', 'vietnamese', {
      type: Sequelize.STRING(200),
      allowNull: false,
    });
  }
};
