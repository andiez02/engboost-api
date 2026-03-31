'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('flashcards', 'repetition', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('flashcards', 'interval', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('flashcards', 'ease_factor', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 2.5,
    });

    await queryInterface.addColumn('flashcards', 'next_review_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });

    await queryInterface.addColumn('flashcards', 'last_reviewed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Backfill next_review_at with created_at for existing rows
    await queryInterface.sequelize.query(
      'UPDATE flashcards SET next_review_at = created_at'
    );

    await queryInterface.addIndex('flashcards', ['user_id', 'next_review_at'], {
      name: 'flashcards_user_id_next_review_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('flashcards', 'flashcards_user_id_next_review_at_idx');
    await queryInterface.removeColumn('flashcards', 'last_reviewed_at');
    await queryInterface.removeColumn('flashcards', 'next_review_at');
    await queryInterface.removeColumn('flashcards', 'ease_factor');
    await queryInterface.removeColumn('flashcards', 'interval');
    await queryInterface.removeColumn('flashcards', 'repetition');
  },
};
