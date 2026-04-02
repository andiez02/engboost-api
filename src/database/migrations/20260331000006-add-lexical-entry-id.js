'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('flashcards', 'lexical_entry_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'lexical_entries',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });

    // Add index
    await queryInterface.addIndex('flashcards', ['lexical_entry_id'], {
      name: 'idx_flashcard_lexical'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('flashcards', 'idx_flashcard_lexical');
    await queryInterface.removeColumn('flashcards', 'lexical_entry_id');
  }
};
