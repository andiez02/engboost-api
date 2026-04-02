'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lexical_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      headword: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      pos: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      senses: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      phonetic: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      audio_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create Unique Index to prevent duplicates
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX uniq_lexical_entry 
      ON lexical_entries (LOWER(headword), COALESCE(pos, ''));
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS uniq_lexical_entry;`);
    await queryInterface.dropTable('lexical_entries');
  }
};
