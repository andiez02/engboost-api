'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add pos column for part-of-speech
    await queryInterface.addColumn('flashcards', 'pos', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Add example column for example sentences
    await queryInterface.addColumn('flashcards', 'example', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add index on pos column for potential future queries
    await queryInterface.addIndex('flashcards', ['pos'], {
      name: 'idx_flashcards_pos',
      where: {
        pos: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface) {
    // Remove index first
    await queryInterface.removeIndex('flashcards', 'idx_flashcards_pos');
    
    // Remove columns
    await queryInterface.removeColumn('flashcards', 'example');
    await queryInterface.removeColumn('flashcards', 'pos');
  },
};
