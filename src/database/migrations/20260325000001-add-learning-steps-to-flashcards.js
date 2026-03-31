'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('flashcards', 'is_learning', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('flashcards', 'learning_step', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // Backfill: graduated cards (repetition > 0) are not in learning phase
    await queryInterface.sequelize.query(
      'UPDATE flashcards SET is_learning = false, learning_step = 0 WHERE repetition > 0'
    );

    // Backfill: new cards (repetition = 0) remain in learning phase
    await queryInterface.sequelize.query(
      'UPDATE flashcards SET is_learning = true, learning_step = 0 WHERE repetition = 0'
    );

    await queryInterface.addIndex('flashcards', ['user_id', 'is_learning', 'next_review_at'], {
      name: 'flashcards_user_id_is_learning_next_review_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'flashcards',
      'flashcards_user_id_is_learning_next_review_at_idx'
    );
    await queryInterface.removeColumn('flashcards', 'learning_step');
    await queryInterface.removeColumn('flashcards', 'is_learning');
  },
};
