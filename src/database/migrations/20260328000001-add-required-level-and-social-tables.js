'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add required_level to folders
    const folderColumns = await queryInterface.describeTable('folders');
    if (!folderColumns.required_level) {
      await queryInterface.addColumn('folders', 'required_level', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      });
    }

    // 2. Create posts table
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('posts')) {
      await queryInterface.createTable('posts', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        folder_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'folders', key: 'id' },
          onDelete: 'CASCADE',
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        like_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        save_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      await queryInterface.addIndex('posts', ['user_id']);
      await queryInterface.addIndex('posts', ['folder_id']);
      await queryInterface.addIndex('posts', ['created_at']);
    }

    // 3. Create post_likes table
    if (!tables.includes('post_likes')) {
      await queryInterface.createTable('post_likes', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        post_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'posts', key: 'id' },
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      await queryInterface.addIndex('post_likes', ['user_id', 'post_id'], {
        unique: true,
        name: 'post_likes_user_id_post_id_unique',
      });
    }

    // 4. Create post_saves table
    if (!tables.includes('post_saves')) {
      await queryInterface.createTable('post_saves', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        post_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'posts', key: 'id' },
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      await queryInterface.addIndex('post_saves', ['user_id', 'post_id'], {
        unique: true,
        name: 'post_saves_user_id_post_id_unique',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('post_saves').catch(() => {});
    await queryInterface.dropTable('post_likes').catch(() => {});
    await queryInterface.dropTable('posts').catch(() => {});

    const folderColumns = await queryInterface.describeTable('folders');
    if (folderColumns.required_level) {
      await queryInterface.removeColumn('folders', 'required_level');
    }
  },
};
