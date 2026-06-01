'use strict';

const { v4: uuidv4 } = require('uuid');

const FOLDERS = [
  {
    title: 'Animals & Nature',
    flashcards: [
      { english: 'butterfly', vietnamese: 'con bướm', pos: 'noun', definition: 'An insect with large colorful wings', example: 'A butterfly landed on the flower.' },
      { english: 'ocean', vietnamese: 'đại dương', pos: 'noun', definition: 'A vast body of salt water', example: 'The ocean covers most of the Earth.' },
      { english: 'mountain', vietnamese: 'núi', pos: 'noun', definition: 'A large natural elevation of earth', example: 'They climbed the mountain at dawn.' },
      { english: 'forest', vietnamese: 'rừng', pos: 'noun', definition: 'A large area covered with trees', example: 'The forest is home to many animals.' },
      { english: 'river', vietnamese: 'con sông', pos: 'noun', definition: 'A large natural stream of water', example: 'We swam in the river.' },
      { english: 'eagle', vietnamese: 'đại bàng', pos: 'noun', definition: 'A large bird of prey', example: 'The eagle soared above the valley.' },
      { english: 'whale', vietnamese: 'cá voi', pos: 'noun', definition: 'The largest marine mammal', example: 'Whales communicate through sound.' },
      { english: 'desert', vietnamese: 'sa mạc', pos: 'noun', definition: 'A dry barren area with little rain', example: 'The Sahara is the largest desert.' },
      { english: 'volcano', vietnamese: 'núi lửa', pos: 'noun', definition: 'A mountain that can erupt lava', example: 'The volcano erupted last year.' },
      { english: 'coral reef', vietnamese: 'rạn san hô', pos: 'noun', definition: 'An underwater ecosystem of coral', example: 'Coral reefs are full of sea life.' },
    ],
  },
  {
    title: 'Food & Cooking',
    flashcards: [
      { english: 'recipe', vietnamese: 'công thức nấu ăn', pos: 'noun', definition: 'Instructions for preparing a dish', example: 'She followed the recipe carefully.' },
      { english: 'ingredient', vietnamese: 'nguyên liệu', pos: 'noun', definition: 'A component used in cooking', example: 'Add all ingredients to the bowl.' },
      { english: 'boil', vietnamese: 'đun sôi', pos: 'verb', definition: 'To heat liquid until it bubbles', example: 'Boil the water before adding pasta.' },
      { english: 'fry', vietnamese: 'chiên', pos: 'verb', definition: 'To cook in hot oil', example: 'Fry the egg in butter.' },
      { english: 'bake', vietnamese: 'nướng', pos: 'verb', definition: 'To cook in an oven', example: 'She bakes bread every Sunday.' },
      { english: 'spicy', vietnamese: 'cay', pos: 'adjective', definition: 'Having a strong hot flavor', example: 'This soup is very spicy.' },
      { english: 'delicious', vietnamese: 'ngon', pos: 'adjective', definition: 'Having a very pleasant taste', example: 'The meal was absolutely delicious.' },
      { english: 'portion', vietnamese: 'khẩu phần', pos: 'noun', definition: 'An amount of food for one person', example: 'The portion size was generous.' },
      { english: 'marinate', vietnamese: 'ướp', pos: 'verb', definition: 'To soak food in seasoned liquid', example: 'Marinate the chicken overnight.' },
      { english: 'simmer', vietnamese: 'đun nhỏ lửa', pos: 'verb', definition: 'To cook gently just below boiling', example: 'Simmer the sauce for 20 minutes.' },
    ],
  },
  {
    title: 'Travel & Places',
    flashcards: [
      { english: 'passport', vietnamese: 'hộ chiếu', pos: 'noun', definition: 'An official travel document', example: 'Do not forget your passport.' },
      { english: 'luggage', vietnamese: 'hành lý', pos: 'noun', definition: 'Bags and suitcases for travel', example: 'She packed her luggage the night before.' },
      { english: 'destination', vietnamese: 'điểm đến', pos: 'noun', definition: 'The place you are traveling to', example: 'Paris is a popular destination.' },
      { english: 'itinerary', vietnamese: 'lịch trình du lịch', pos: 'noun', definition: 'A planned route or journey', example: 'The tour guide shared the itinerary.' },
      { english: 'souvenir', vietnamese: 'quà lưu niệm', pos: 'noun', definition: 'An object kept as a reminder of travel', example: 'She bought a souvenir at the market.' },
      { english: 'landmark', vietnamese: 'địa danh nổi tiếng', pos: 'noun', definition: 'A recognizable feature of a place', example: 'The Eiffel Tower is a famous landmark.' },
      { english: 'customs', vietnamese: 'hải quan', pos: 'noun', definition: 'The official border control process', example: 'We waited at customs for an hour.' },
      { english: 'accommodation', vietnamese: 'chỗ ở', pos: 'noun', definition: 'A place to stay while traveling', example: 'Book accommodation in advance.' },
      { english: 'jet lag', vietnamese: 'mệt mỏi do lệch múi giờ', pos: 'noun', definition: 'Tiredness from crossing time zones', example: 'She suffered from jet lag after the flight.' },
      { english: 'backpack', vietnamese: 'ba lô', pos: 'noun', definition: 'A bag carried on the back', example: 'He traveled with just a backpack.' },
    ],
  },
  {
    title: 'Technology & Internet',
    flashcards: [
      { english: 'algorithm', vietnamese: 'thuật toán', pos: 'noun', definition: 'A set of rules for solving a problem', example: 'The algorithm sorts data quickly.' },
      { english: 'bandwidth', vietnamese: 'băng thông', pos: 'noun', definition: 'The capacity of a network connection', example: 'High bandwidth allows faster streaming.' },
      { english: 'cloud', vietnamese: 'điện toán đám mây', pos: 'noun', definition: 'Remote servers for storing data', example: 'Save your files to the cloud.' },
      { english: 'encrypt', vietnamese: 'mã hóa', pos: 'verb', definition: 'To convert data into a secure code', example: 'Encrypt your messages for privacy.' },
      { english: 'interface', vietnamese: 'giao diện', pos: 'noun', definition: 'A point of interaction between systems', example: 'The app has a clean interface.' },
      { english: 'download', vietnamese: 'tải xuống', pos: 'verb', definition: 'To transfer data from a server', example: 'Download the app from the store.' },
      { english: 'upload', vietnamese: 'tải lên', pos: 'verb', definition: 'To transfer data to a server', example: 'Upload your photo to the website.' },
      { english: 'software', vietnamese: 'phần mềm', pos: 'noun', definition: 'Programs used by a computer', example: 'Install the latest software update.' },
      { english: 'hardware', vietnamese: 'phần cứng', pos: 'noun', definition: 'Physical components of a computer', example: 'The hardware needs to be upgraded.' },
      { english: 'cybersecurity', vietnamese: 'an ninh mạng', pos: 'noun', definition: 'Protection of computer systems', example: 'Cybersecurity is increasingly important.' },
    ],
  },
  {
    title: 'Health & Body',
    flashcards: [
      { english: 'symptom', vietnamese: 'triệu chứng', pos: 'noun', definition: 'A sign of illness or disease', example: 'Fever is a common symptom of flu.' },
      { english: 'diagnose', vietnamese: 'chẩn đoán', pos: 'verb', definition: 'To identify a disease or condition', example: 'The doctor diagnosed her with anemia.' },
      { english: 'prescription', vietnamese: 'đơn thuốc', pos: 'noun', definition: 'A doctor\'s written order for medicine', example: 'Take this prescription to the pharmacy.' },
      { english: 'immune', vietnamese: 'miễn dịch', pos: 'adjective', definition: 'Protected against a disease', example: 'She is immune to chickenpox.' },
      { english: 'nutrition', vietnamese: 'dinh dưỡng', pos: 'noun', definition: 'The process of getting food and nutrients', example: 'Good nutrition is key to health.' },
      { english: 'exercise', vietnamese: 'tập thể dục', pos: 'verb', definition: 'To do physical activity for health', example: 'Exercise at least 30 minutes daily.' },
      { english: 'chronic', vietnamese: 'mãn tính', pos: 'adjective', definition: 'Persisting for a long time', example: 'He has chronic back pain.' },
      { english: 'recovery', vietnamese: 'sự hồi phục', pos: 'noun', definition: 'The process of getting better', example: 'Her recovery was faster than expected.' },
      { english: 'vaccine', vietnamese: 'vắc-xin', pos: 'noun', definition: 'A substance that prevents disease', example: 'Get the flu vaccine every year.' },
      { english: 'mental health', vietnamese: 'sức khỏe tâm thần', pos: 'noun', definition: 'Emotional and psychological wellbeing', example: 'Mental health is as important as physical health.' },
    ],
  },
  {
    title: 'Emotions & Feelings',
    flashcards: [
      { english: 'anxious', vietnamese: 'lo lắng', pos: 'adjective', definition: 'Feeling worried or nervous', example: 'She felt anxious before the exam.' },
      { english: 'grateful', vietnamese: 'biết ơn', pos: 'adjective', definition: 'Feeling thankful for something', example: 'I am grateful for your support.' },
      { english: 'overwhelmed', vietnamese: 'choáng ngợp', pos: 'adjective', definition: 'Feeling too much to handle', example: 'He felt overwhelmed by the workload.' },
      { english: 'confident', vietnamese: 'tự tin', pos: 'adjective', definition: 'Feeling sure of oneself', example: 'She walked in feeling confident.' },
      { english: 'frustrated', vietnamese: 'thất vọng / bực bội', pos: 'adjective', definition: 'Feeling annoyed due to obstacles', example: 'He was frustrated by the delay.' },
      { english: 'relieved', vietnamese: 'nhẹ nhõm', pos: 'adjective', definition: 'Feeling free from worry', example: 'She was relieved to hear the news.' },
      { english: 'jealous', vietnamese: 'ghen tị', pos: 'adjective', definition: 'Feeling envious of someone', example: 'He was jealous of her success.' },
      { english: 'proud', vietnamese: 'tự hào', pos: 'adjective', definition: 'Feeling pleased about an achievement', example: 'She was proud of her work.' },
      { english: 'lonely', vietnamese: 'cô đơn', pos: 'adjective', definition: 'Feeling sad from being alone', example: 'Moving abroad made him feel lonely.' },
      { english: 'excited', vietnamese: 'hào hứng', pos: 'adjective', definition: 'Feeling enthusiastic and eager', example: 'The kids were excited about the trip.' },
    ],
  },
  {
    title: 'Work & Career',
    flashcards: [
      { english: 'resume', vietnamese: 'hồ sơ xin việc', pos: 'noun', definition: 'A document listing work experience', example: 'Update your resume before applying.' },
      { english: 'interview', vietnamese: 'phỏng vấn', pos: 'noun', definition: 'A formal meeting to assess a candidate', example: 'She prepared well for the interview.' },
      { english: 'promotion', vietnamese: 'thăng chức', pos: 'noun', definition: 'An advancement to a higher position', example: 'He received a promotion last month.' },
      { english: 'salary', vietnamese: 'lương', pos: 'noun', definition: 'Fixed regular payment for work', example: 'Her salary increased this year.' },
      { english: 'resign', vietnamese: 'từ chức', pos: 'verb', definition: 'To voluntarily leave a job', example: 'She decided to resign from her position.' },
      { english: 'colleague', vietnamese: 'đồng nghiệp', pos: 'noun', definition: 'A person you work with', example: 'My colleague helped me with the report.' },
      { english: 'freelance', vietnamese: 'làm tự do', pos: 'adjective', definition: 'Working independently for multiple clients', example: 'He works as a freelance designer.' },
      { english: 'remote work', vietnamese: 'làm việc từ xa', pos: 'noun', definition: 'Working outside the office', example: 'Remote work became common after 2020.' },
      { english: 'deadline', vietnamese: 'hạn chót', pos: 'noun', definition: 'The latest time to complete a task', example: 'Submit the project before the deadline.' },
      { english: 'networking', vietnamese: 'kết nối chuyên nghiệp', pos: 'noun', definition: 'Building professional relationships', example: 'Networking helps you find new opportunities.' },
    ],
  },
  {
    title: 'Sports & Fitness',
    flashcards: [
      { english: 'athlete', vietnamese: 'vận động viên', pos: 'noun', definition: 'A person trained in sports', example: 'She is a professional athlete.' },
      { english: 'tournament', vietnamese: 'giải đấu', pos: 'noun', definition: 'A series of competitive games', example: 'The tennis tournament starts next week.' },
      { english: 'stamina', vietnamese: 'sức bền', pos: 'noun', definition: 'The ability to sustain effort', example: 'Running builds stamina over time.' },
      { english: 'warm up', vietnamese: 'khởi động', pos: 'verb', definition: 'To prepare the body for exercise', example: 'Always warm up before training.' },
      { english: 'coach', vietnamese: 'huấn luyện viên', pos: 'noun', definition: 'A person who trains athletes', example: 'The coach gave great advice.' },
      { english: 'championship', vietnamese: 'chức vô địch', pos: 'noun', definition: 'A competition for the top title', example: 'They won the national championship.' },
      { english: 'injury', vietnamese: 'chấn thương', pos: 'noun', definition: 'Physical damage from sport or accident', example: 'He recovered from a knee injury.' },
      { english: 'sprint', vietnamese: 'chạy nước rút', pos: 'verb', definition: 'To run at full speed', example: 'She sprinted to the finish line.' },
      { english: 'endurance', vietnamese: 'sức chịu đựng', pos: 'noun', definition: 'The ability to keep going despite difficulty', example: 'Marathon running requires great endurance.' },
      { english: 'score', vietnamese: 'ghi điểm', pos: 'verb', definition: 'To gain a point in a game', example: 'He scored the winning goal.' },
    ],
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`
    );

    if (!admins.length) {
      console.warn('⚠️  No ADMIN user found. Skipping community folder seed.');
      return;
    }

    const adminId = admins[0].id;
    const now = new Date();

    for (const folderDef of FOLDERS) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM folders WHERE title = :title AND user_id = :userId LIMIT 1`,
        { replacements: { title: folderDef.title, userId: adminId } }
      );

      if (existing.length) {
        console.log(`⏭  Skipping existing folder: "${folderDef.title}"`);
        continue;
      }

      const folderId = uuidv4();

      await queryInterface.bulkInsert('folders', [{
        id: folderId,
        title: folderDef.title,
        user_id: adminId,
        is_public: true,
        required_level: 0,
        flashcard_count: folderDef.flashcards.length,
        tags: '{}',
        created_at: now,
        updated_at: now,
      }]);

      const flashcardRows = folderDef.flashcards.map((fc) => ({
        id: uuidv4(),
        english: fc.english,
        vietnamese: fc.vietnamese,
        pos: fc.pos,
        definition: fc.definition,
        example: fc.example,
        senses: JSON.stringify([{
          translation: fc.vietnamese,
          definition: fc.definition,
          examples: fc.example ? [{ sentence: fc.example }] : [],
        }]),
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
      console.log(`✅ Seeded: "${folderDef.title}" (community, ${folderDef.flashcards.length} cards)`);
    }
  },

  async down(queryInterface) {
    const titles = FOLDERS.map((f) => f.title);
    await queryInterface.sequelize.query(
      `DELETE FROM flashcards WHERE folder_id IN (
        SELECT id FROM folders WHERE title IN (:titles) AND required_level = 0
      )`,
      { replacements: { titles } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM folders WHERE title IN (:titles) AND required_level = 0`,
      { replacements: { titles } }
    );
    console.log('🗑  Removed community folder seed data.');
  },
};
