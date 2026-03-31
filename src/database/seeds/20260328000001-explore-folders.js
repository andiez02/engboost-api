'use strict';

const { v4: uuidv4 } = require('uuid');

const FOLDERS = [
  // ── EARLY GAME ──────────────────────────────────────────────────────────
  {
    title: 'Basic Vocabulary',
    required_level: 1,
    flashcards: [
      { english: 'apple', vietnamese: 'quả táo' },
      { english: 'book', vietnamese: 'quyển sách' },
      { english: 'car', vietnamese: 'xe hơi' },
      { english: 'dog', vietnamese: 'con chó' },
      { english: 'cat', vietnamese: 'con mèo' },
      { english: 'water', vietnamese: 'nước' },
      { english: 'food', vietnamese: 'thức ăn' },
      { english: 'house', vietnamese: 'ngôi nhà' },
      { english: 'school', vietnamese: 'trường học' },
      { english: 'teacher', vietnamese: 'giáo viên' },
    ],
  },
  {
    title: 'Daily Conversation',
    required_level: 2,
    flashcards: [
      { english: 'How are you?', vietnamese: 'Bạn khỏe không?' },
      { english: "I'm fine", vietnamese: 'Tôi ổn' },
      { english: 'Thank you', vietnamese: 'Cảm ơn' },
      { english: "You're welcome", vietnamese: 'Không có gì' },
      { english: 'Excuse me', vietnamese: 'Xin lỗi (gây chú ý)' },
      { english: 'Sorry', vietnamese: 'Xin lỗi' },
      { english: 'See you later', vietnamese: 'Hẹn gặp lại' },
      { english: 'Good morning', vietnamese: 'Chào buổi sáng' },
      { english: 'Good night', vietnamese: 'Chúc ngủ ngon' },
      { english: "What's your name?", vietnamese: 'Bạn tên là gì?' },
    ],
  },
  {
    title: 'Common Verbs',
    required_level: 3,
    flashcards: [
      { english: 'eat', vietnamese: 'ăn' },
      { english: 'drink', vietnamese: 'uống' },
      { english: 'go', vietnamese: 'đi' },
      { english: 'come', vietnamese: 'đến' },
      { english: 'run', vietnamese: 'chạy' },
      { english: 'walk', vietnamese: 'đi bộ' },
      { english: 'sleep', vietnamese: 'ngủ' },
      { english: 'read', vietnamese: 'đọc' },
      { english: 'write', vietnamese: 'viết' },
      { english: 'speak', vietnamese: 'nói' },
    ],
  },

  // ── MID GAME ─────────────────────────────────────────────────────────────
  {
    title: 'TOEIC 300',
    required_level: 4,
    flashcards: [
      { english: 'schedule', vietnamese: 'lịch trình' },
      { english: 'meeting', vietnamese: 'cuộc họp' },
      { english: 'deadline', vietnamese: 'hạn chót' },
      { english: 'report', vietnamese: 'báo cáo' },
      { english: 'manager', vietnamese: 'quản lý' },
      { english: 'employee', vietnamese: 'nhân viên' },
      { english: 'office', vietnamese: 'văn phòng' },
      { english: 'project', vietnamese: 'dự án' },
      { english: 'task', vietnamese: 'nhiệm vụ' },
      { english: 'email', vietnamese: 'thư điện tử' },
    ],
  },
  {
    title: 'Grammar Basics',
    required_level: 5,
    flashcards: [
      { english: 'I am a student', vietnamese: 'Tôi là học sinh' },
      { english: 'She is happy', vietnamese: 'Cô ấy hạnh phúc' },
      { english: 'They are here', vietnamese: 'Họ ở đây' },
      { english: 'I have a book', vietnamese: 'Tôi có một cuốn sách' },
      { english: 'He has a car', vietnamese: 'Anh ấy có xe hơi' },
      { english: 'Do you like coffee?', vietnamese: 'Bạn có thích cà phê không?' },
      { english: "I don't understand", vietnamese: 'Tôi không hiểu' },
      { english: "She doesn't like tea", vietnamese: 'Cô ấy không thích trà' },
    ],
  },
  {
    title: 'TOEIC 500',
    required_level: 6,
    flashcards: [
      { english: 'negotiation', vietnamese: 'đàm phán' },
      { english: 'contract', vietnamese: 'hợp đồng' },
      { english: 'proposal', vietnamese: 'đề xuất' },
      { english: 'client', vietnamese: 'khách hàng' },
      { english: 'supplier', vietnamese: 'nhà cung cấp' },
      { english: 'revenue', vietnamese: 'doanh thu' },
      { english: 'budget', vietnamese: 'ngân sách' },
    ],
  },
  {
    title: 'Collocations',
    required_level: 7,
    flashcards: [
      { english: 'make a decision', vietnamese: 'đưa ra quyết định' },
      { english: 'take a break', vietnamese: 'nghỉ giải lao' },
      { english: 'do homework', vietnamese: 'làm bài tập' },
      { english: 'have a meeting', vietnamese: 'có cuộc họp' },
      { english: 'give advice', vietnamese: 'đưa lời khuyên' },
    ],
  },

  // ── LATE GAME ─────────────────────────────────────────────────────────────
  {
    title: 'IELTS Vocabulary',
    required_level: 8,
    flashcards: [
      { english: 'sustainable', vietnamese: 'bền vững' },
      { english: 'innovation', vietnamese: 'đổi mới' },
      { english: 'environment', vietnamese: 'môi trường' },
      { english: 'pollution', vietnamese: 'ô nhiễm' },
      { english: 'education', vietnamese: 'giáo dục' },
    ],
  },
  {
    title: 'Academic Words',
    required_level: 9,
    flashcards: [
      { english: 'analyze', vietnamese: 'phân tích' },
      { english: 'approach', vietnamese: 'phương pháp' },
      { english: 'concept', vietnamese: 'khái niệm' },
      { english: 'data', vietnamese: 'dữ liệu' },
      { english: 'theory', vietnamese: 'lý thuyết' },
    ],
  },
  {
    title: 'IELTS Advanced',
    required_level: 10,
    flashcards: [
      { english: 'mitigate', vietnamese: 'giảm thiểu' },
      { english: 'substantial', vietnamese: 'đáng kể' },
      { english: 'inevitable', vietnamese: 'không thể tránh khỏi' },
      { english: 'controversial', vietnamese: 'gây tranh cãi' },
    ],
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Find the first ADMIN user to own these folders
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`
    );

    if (!admins.length) {
      console.warn('⚠️  No ADMIN user found. Skipping explore folder seed.');
      return;
    }

    const adminId = admins[0].id;
    const now = new Date();

    for (const folderDef of FOLDERS) {
      // Skip if folder with same title already owned by this admin
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM folders WHERE title = :title AND user_id = :userId LIMIT 1`,
        { replacements: { title: folderDef.title, userId: adminId } }
      );

      if (existing.length) {
        console.log(`⏭  Skipping existing folder: "${folderDef.title}"`);
        continue;
      }

      const folderId = uuidv4();

      await queryInterface.bulkInsert('folders', [
        {
          id: folderId,
          title: folderDef.title,
          user_id: adminId,
          is_public: true,
          required_level: folderDef.required_level,
          flashcard_count: folderDef.flashcards.length,
          created_at: now,
          updated_at: now,
        },
      ]);

      const flashcardRows = folderDef.flashcards.map((fc) => ({
        id: uuidv4(),
        english: fc.english,
        vietnamese: fc.vietnamese,
        object: null,
        image_url: null,
        folder_id: folderId,
        user_id: adminId,
        is_public: true,
        repetition: 0,
        interval: 0,
        ease_factor: 2.5,
        next_review_at: now,
        last_reviewed_at: null,
        is_learning: true,
        learning_step: 0,
        created_at: now,
        updated_at: now,
      }));

      await queryInterface.bulkInsert('flashcards', flashcardRows);
      console.log(`✅ Seeded: "${folderDef.title}" (level ${folderDef.required_level}, ${folderDef.flashcards.length} cards)`);
    }
  },

  async down(queryInterface) {
    const titles = FOLDERS.map((f) => f.title);
    // Delete flashcards first (cascade would handle it, but explicit is safer)
    await queryInterface.sequelize.query(
      `DELETE FROM flashcards WHERE folder_id IN (
        SELECT id FROM folders WHERE title IN (:titles) AND is_public = true
      )`,
      { replacements: { titles } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM folders WHERE title IN (:titles) AND is_public = true`,
      { replacements: { titles } }
    );
    console.log('🗑  Removed explore folder seed data.');
  },
};
