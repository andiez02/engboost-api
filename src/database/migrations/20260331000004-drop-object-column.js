'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop object column since it was a Phase 1 legacy column that is no longer used
    await queryInterface.removeColumn('flashcards', 'object');
  },

  async down(queryInterface, Sequelize) {
    // Re-add object if reverting this migration
    await queryInterface.addColumn('flashcards', 'object', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
  }
};
