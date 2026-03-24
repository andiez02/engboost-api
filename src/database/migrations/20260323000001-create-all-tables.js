'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ==================== Users ====================
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      avatar: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'CLIENT',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verify_token: {
        type: Sequelize.UUID,
        allowNull: true,
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

    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });
    await queryInterface.addIndex('users', ['username'], { name: 'users_username_idx' });
    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });

    // ==================== Folders ====================
    await queryInterface.createTable('folders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      flashcard_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('folders', ['user_id'], { name: 'folders_user_id_idx' });
    await queryInterface.addIndex('folders', ['title', 'user_id'], {
      unique: true,
      name: 'folders_title_user_id_unique',
    });

    // ==================== Flashcards ====================
    await queryInterface.createTable('flashcards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      english: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      vietnamese: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      object: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      folder_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'folders', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('flashcards', ['folder_id'], { name: 'flashcards_folder_id_idx' });
    await queryInterface.addIndex('flashcards', ['user_id'], { name: 'flashcards_user_id_idx' });

    // ==================== Courses ====================
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      video_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      video_duration: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      video_format: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '',
      },
      video_public_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      thumbnail_url: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      thumbnail_public_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // ==================== User Courses ====================
    await queryInterface.createTable('user_courses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      registered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('user_courses', ['user_id', 'course_id'], {
      unique: true,
      name: 'user_courses_user_id_course_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_courses');
    await queryInterface.dropTable('flashcards');
    await queryInterface.dropTable('courses');
    await queryInterface.dropTable('folders');
    await queryInterface.dropTable('users');
  },
};
