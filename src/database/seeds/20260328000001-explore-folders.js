'use strict';

const { v4: uuidv4 } = require('uuid');

const FOLDERS = [
  {
    title: 'Basic Vocabulary',
    required_level: 1,
    flashcards: [
      { english: 'apple', vietnamese: 'quả táo', pos: 'noun', definition: 'A round fruit with red or green skin', example: 'I eat an apple every morning.' },
      { english: 'book', vietnamese: 'quyển sách', pos: 'noun', definition: 'A written or printed work', example: 'She reads a book before bed.' },
      { english: 'water', vietnamese: 'nước', pos: 'noun', definition: 'A clear liquid essential for life', example: 'Drink more water every day.' },
      { english: 'house', vietnamese: 'ngôi nhà', pos: 'noun', definition: 'A building where people live', example: 'They bought a new house.' },
      { english: 'school', vietnamese: 'trường học', pos: 'noun', definition: 'A place where students learn', example: 'She goes to school by bus.' },
      { english: 'teacher', vietnamese: 'giáo viên', pos: 'noun', definition: 'A person who teaches students', example: 'My teacher is very kind.' },
      { english: 'dog', vietnamese: 'con chó', pos: 'noun', definition: 'A common domestic animal', example: 'The dog barks at strangers.' },
      { english: 'cat', vietnamese: 'con mèo', pos: 'noun', definition: 'A small furry domestic animal', example: 'The cat sleeps on the sofa.' },
      { english: 'car', vietnamese: 'xe hơi', pos: 'noun', definition: 'A motor vehicle for transport', example: 'He drives his car to work.' },
      { english: 'food', vietnamese: 'thức ăn', pos: 'noun', definition: 'Any substance eaten for nutrition', example: 'Vietnamese food is delicious.' },
    ],
  },
  {
    title: 'Daily Conversation',
    required_level: 2,
    flashcards: [
      { english: 'hello', vietnamese: 'xin chào', pos: 'phrase', definition: 'A greeting used when meeting someone', example: 'Hello! How are you today?' },
      { english: 'thank you', vietnamese: 'cảm ơn', pos: 'phrase', definition: 'An expression of gratitude', example: 'Thank you for your help.' },
      { english: 'sorry', vietnamese: 'xin lỗi', pos: 'phrase', definition: 'An expression of apology', example: 'Sorry, I was late.' },
      { english: 'please', vietnamese: 'làm ơn', pos: 'adverb', definition: 'Used to make a polite request', example: 'Please sit down.' },
      { english: 'excuse me', vietnamese: 'xin lỗi (gây chú ý)', pos: 'phrase', definition: 'Used to politely get attention', example: 'Excuse me, where is the station?' },
      { english: 'good morning', vietnamese: 'chào buổi sáng', pos: 'phrase', definition: 'A greeting used in the morning', example: 'Good morning, everyone!' },
      { english: 'good night', vietnamese: 'chúc ngủ ngon', pos: 'phrase', definition: 'A farewell said before sleeping', example: 'Good night, sleep well.' },
      { english: 'see you later', vietnamese: 'hẹn gặp lại', pos: 'phrase', definition: 'An informal farewell', example: 'See you later, bye!' },
      { english: 'how are you', vietnamese: 'bạn khỏe không', pos: 'phrase', definition: 'A common greeting question', example: 'Hi! How are you doing?' },
      { english: 'nice to meet you', vietnamese: 'rất vui được gặp bạn', pos: 'phrase', definition: 'Said when meeting someone for the first time', example: 'Nice to meet you, I am Minh.' },
    ],
  },
  {
    title: 'Common Verbs',
    required_level: 3,
    flashcards: [
      { english: 'eat', vietnamese: 'ăn', pos: 'verb', definition: 'To put food in your mouth and swallow it', example: 'I eat breakfast at 7am.' },
      { english: 'drink', vietnamese: 'uống', pos: 'verb', definition: 'To take liquid into your mouth', example: 'She drinks coffee every morning.' },
      { english: 'run', vietnamese: 'chạy', pos: 'verb', definition: 'To move quickly on foot', example: 'He runs 5km every day.' },
      { english: 'walk', vietnamese: 'đi bộ', pos: 'verb', definition: 'To move at a normal pace on foot', example: 'We walk to the park together.' },
      { english: 'sleep', vietnamese: 'ngủ', pos: 'verb', definition: 'To rest with eyes closed', example: 'Children should sleep 8 hours.' },
      { english: 'read', vietnamese: 'đọc', pos: 'verb', definition: 'To look at and understand written words', example: 'I read the news every morning.' },
      { english: 'write', vietnamese: 'viết', pos: 'verb', definition: 'To form letters or words on a surface', example: 'She writes in her diary daily.' },
      { english: 'speak', vietnamese: 'nói', pos: 'verb', definition: 'To say words aloud', example: 'He speaks English fluently.' },
      { english: 'listen', vietnamese: 'lắng nghe', pos: 'verb', definition: 'To pay attention to sounds', example: 'Please listen carefully.' },
      { english: 'learn', vietnamese: 'học', pos: 'verb', definition: 'To gain knowledge or skill', example: 'I want to learn French.' },
    ],
  },
  {
    title: 'TOEIC 300',
    required_level: 4,
    flashcards: [
      { english: 'schedule', vietnamese: 'lịch trình', pos: 'noun', definition: 'A plan of activities and times', example: 'Please check the meeting schedule.' },
      { english: 'deadline', vietnamese: 'hạn chót', pos: 'noun', definition: 'The latest time something must be done', example: 'The deadline is Friday at 5pm.' },
      { english: 'report', vietnamese: 'báo cáo', pos: 'noun', definition: 'A formal document about a topic', example: 'Submit the report by Monday.' },
      { english: 'manager', vietnamese: 'quản lý', pos: 'noun', definition: 'A person who controls a team', example: 'The manager approved the plan.' },
      { english: 'employee', vietnamese: 'nhân viên', pos: 'noun', definition: 'A person who works for a company', example: 'All employees must attend training.' },
      { english: 'project', vietnamese: 'dự án', pos: 'noun', definition: 'A planned piece of work', example: 'The project will take 3 months.' },
      { english: 'meeting', vietnamese: 'cuộc họp', pos: 'noun', definition: 'A gathering to discuss something', example: 'We have a meeting at 9am.' },
      { english: 'confirm', vietnamese: 'xác nhận', pos: 'verb', definition: 'To state that something is true', example: 'Please confirm your attendance.' },
      { english: 'available', vietnamese: 'có sẵn / rảnh', pos: 'adjective', definition: 'Free to be used or met', example: 'Are you available on Thursday?' },
      { english: 'urgent', vietnamese: 'khẩn cấp', pos: 'adjective', definition: 'Requiring immediate action', example: 'This is an urgent matter.' },
    ],
  },
  {
    title: 'Grammar Essentials',
    required_level: 5,
    flashcards: [
      { english: 'although', vietnamese: 'mặc dù', pos: 'conjunction', definition: 'Used to introduce a contrast', example: 'Although it rained, we went out.' },
      { english: 'however', vietnamese: 'tuy nhiên', pos: 'adverb', definition: 'Used to introduce a contrasting idea', example: 'I was tired; however, I finished.' },
      { english: 'therefore', vietnamese: 'vì vậy', pos: 'adverb', definition: 'As a result of that', example: 'She studied hard; therefore, she passed.' },
      { english: 'moreover', vietnamese: 'hơn nữa', pos: 'adverb', definition: 'In addition to what has been said', example: 'Moreover, the price is reasonable.' },
      { english: 'unless', vietnamese: 'trừ khi', pos: 'conjunction', definition: 'Except if', example: 'Unless you hurry, you will be late.' },
      { english: 'despite', vietnamese: 'mặc dù (+ noun)', pos: 'preposition', definition: 'Without being affected by', example: 'Despite the rain, she smiled.' },
      { english: 'whereas', vietnamese: 'trong khi đó', pos: 'conjunction', definition: 'In contrast to the fact that', example: 'He is tall, whereas she is short.' },
      { english: 'consequently', vietnamese: 'do đó', pos: 'adverb', definition: 'As a result', example: 'He missed the bus; consequently, he was late.' },
      { english: 'furthermore', vietnamese: 'hơn nữa', pos: 'adverb', definition: 'In addition', example: 'Furthermore, the data supports this.' },
      { english: 'nevertheless', vietnamese: 'tuy vậy', pos: 'adverb', definition: 'In spite of that', example: 'It was hard; nevertheless, she succeeded.' },
    ],
  },
  {
    title: 'TOEIC 500',
    required_level: 6,
    flashcards: [
      { english: 'negotiation', vietnamese: 'đàm phán', pos: 'noun', definition: 'Discussion to reach an agreement', example: 'The negotiation lasted two hours.' },
      { english: 'contract', vietnamese: 'hợp đồng', pos: 'noun', definition: 'A legal agreement between parties', example: 'Sign the contract before starting.' },
      { english: 'revenue', vietnamese: 'doanh thu', pos: 'noun', definition: 'Income generated by a business', example: 'Revenue increased by 20% this year.' },
      { english: 'budget', vietnamese: 'ngân sách', pos: 'noun', definition: 'A financial plan for spending', example: 'We need to stay within budget.' },
      { english: 'proposal', vietnamese: 'đề xuất', pos: 'noun', definition: 'A plan or suggestion put forward', example: 'She submitted a detailed proposal.' },
      { english: 'implement', vietnamese: 'thực hiện', pos: 'verb', definition: 'To put a plan into action', example: 'We will implement the new policy.' },
      { english: 'efficient', vietnamese: 'hiệu quả', pos: 'adjective', definition: 'Achieving results without waste', example: 'The new system is more efficient.' },
      { english: 'collaborate', vietnamese: 'hợp tác', pos: 'verb', definition: 'To work together with others', example: 'Teams collaborate across departments.' },
      { english: 'strategy', vietnamese: 'chiến lược', pos: 'noun', definition: 'A plan to achieve a goal', example: 'The marketing strategy worked well.' },
      { english: 'evaluate', vietnamese: 'đánh giá', pos: 'verb', definition: 'To assess the value of something', example: 'We evaluate performance quarterly.' },
    ],
  },
  {
    title: 'Collocations',
    required_level: 7,
    flashcards: [
      { english: 'make a decision', vietnamese: 'đưa ra quyết định', pos: 'phrase', definition: 'To decide something', example: 'It is time to make a decision.' },
      { english: 'take a break', vietnamese: 'nghỉ giải lao', pos: 'phrase', definition: 'To stop working temporarily', example: 'Let us take a break for 10 minutes.' },
      { english: 'give advice', vietnamese: 'đưa lời khuyên', pos: 'phrase', definition: 'To offer suggestions to someone', example: 'She gave me useful advice.' },
      { english: 'pay attention', vietnamese: 'chú ý', pos: 'phrase', definition: 'To focus on something carefully', example: 'Please pay attention in class.' },
      { english: 'make progress', vietnamese: 'tiến bộ', pos: 'phrase', definition: 'To move forward toward a goal', example: 'You are making great progress.' },
      { english: 'take responsibility', vietnamese: 'chịu trách nhiệm', pos: 'phrase', definition: 'To accept duty for something', example: 'He took responsibility for the error.' },
      { english: 'reach a goal', vietnamese: 'đạt được mục tiêu', pos: 'phrase', definition: 'To achieve what you aimed for', example: 'She reached her goal this year.' },
      { english: 'raise awareness', vietnamese: 'nâng cao nhận thức', pos: 'phrase', definition: 'To increase understanding of an issue', example: 'The campaign raised awareness.' },
      { english: 'meet a deadline', vietnamese: 'hoàn thành đúng hạn', pos: 'phrase', definition: 'To finish work by the required time', example: 'We always meet our deadlines.' },
      { english: 'draw a conclusion', vietnamese: 'rút ra kết luận', pos: 'phrase', definition: 'To decide something based on evidence', example: 'We can draw a conclusion from the data.' },
    ],
  },
  {
    title: 'IELTS Vocabulary',
    required_level: 8,
    flashcards: [
      { english: 'sustainable', vietnamese: 'bền vững', pos: 'adjective', definition: 'Able to be maintained long-term', example: 'We need sustainable energy sources.' },
      { english: 'innovation', vietnamese: 'đổi mới', pos: 'noun', definition: 'A new idea or method', example: 'Innovation drives economic growth.' },
      { english: 'pollution', vietnamese: 'ô nhiễm', pos: 'noun', definition: 'Harmful substances in the environment', example: 'Air pollution is a global problem.' },
      { english: 'globalization', vietnamese: 'toàn cầu hóa', pos: 'noun', definition: 'The process of worldwide integration', example: 'Globalization affects local cultures.' },
      { english: 'infrastructure', vietnamese: 'cơ sở hạ tầng', pos: 'noun', definition: 'Basic systems of a country', example: 'The city improved its infrastructure.' },
      { english: 'inequality', vietnamese: 'bất bình đẳng', pos: 'noun', definition: 'Unfair differences between groups', example: 'Income inequality is rising.' },
      { english: 'renewable', vietnamese: 'có thể tái tạo', pos: 'adjective', definition: 'Able to be replenished naturally', example: 'Solar is a renewable energy source.' },
      { english: 'urbanization', vietnamese: 'đô thị hóa', pos: 'noun', definition: 'The growth of cities', example: 'Rapid urbanization causes problems.' },
      { english: 'biodiversity', vietnamese: 'đa dạng sinh học', pos: 'noun', definition: 'Variety of life in an ecosystem', example: 'Deforestation reduces biodiversity.' },
      { english: 'migration', vietnamese: 'di cư', pos: 'noun', definition: 'Movement of people to a new place', example: 'Migration affects population growth.' },
    ],
  },
  {
    title: 'Academic Words',
    required_level: 9,
    flashcards: [
      { english: 'analyze', vietnamese: 'phân tích', pos: 'verb', definition: 'To examine in detail', example: 'Analyze the data carefully.' },
      { english: 'hypothesis', vietnamese: 'giả thuyết', pos: 'noun', definition: 'A proposed explanation to be tested', example: 'The hypothesis was proven correct.' },
      { english: 'methodology', vietnamese: 'phương pháp luận', pos: 'noun', definition: 'A system of methods used in research', example: 'Explain your research methodology.' },
      { english: 'empirical', vietnamese: 'thực nghiệm', pos: 'adjective', definition: 'Based on observation or experiment', example: 'We need empirical evidence.' },
      { english: 'paradigm', vietnamese: 'mô hình tư duy', pos: 'noun', definition: 'A typical example or pattern', example: 'This is a paradigm shift in science.' },
      { english: 'synthesize', vietnamese: 'tổng hợp', pos: 'verb', definition: 'To combine elements into a whole', example: 'Synthesize information from sources.' },
      { english: 'coherent', vietnamese: 'mạch lạc', pos: 'adjective', definition: 'Logical and consistent', example: 'Write a coherent argument.' },
      { english: 'implication', vietnamese: 'hàm ý / tác động', pos: 'noun', definition: 'A likely consequence or meaning', example: 'Consider the implications of this.' },
      { english: 'quantitative', vietnamese: 'định lượng', pos: 'adjective', definition: 'Relating to measurable quantities', example: 'Use quantitative data in your study.' },
      { english: 'qualitative', vietnamese: 'định tính', pos: 'adjective', definition: 'Relating to quality or characteristics', example: 'Qualitative research uses interviews.' },
    ],
  },
  {
    title: 'IELTS Advanced',
    required_level: 10,
    flashcards: [
      { english: 'mitigate', vietnamese: 'giảm thiểu', pos: 'verb', definition: 'To make something less severe', example: 'Measures to mitigate climate change.' },
      { english: 'inevitable', vietnamese: 'không thể tránh khỏi', pos: 'adjective', definition: 'Certain to happen', example: 'Change is inevitable in life.' },
      { english: 'controversial', vietnamese: 'gây tranh cãi', pos: 'adjective', definition: 'Causing disagreement or debate', example: 'The policy is highly controversial.' },
      { english: 'exacerbate', vietnamese: 'làm trầm trọng thêm', pos: 'verb', definition: 'To make a problem worse', example: 'Drought exacerbates food shortages.' },
      { english: 'proliferate', vietnamese: 'lan rộng nhanh chóng', pos: 'verb', definition: 'To increase rapidly in number', example: 'Social media platforms proliferate.' },
      { english: 'ambiguous', vietnamese: 'mơ hồ', pos: 'adjective', definition: 'Open to more than one interpretation', example: 'The statement was ambiguous.' },
      { english: 'unprecedented', vietnamese: 'chưa từng có', pos: 'adjective', definition: 'Never done or known before', example: 'An unprecedented economic crisis.' },
      { english: 'detrimental', vietnamese: 'có hại', pos: 'adjective', definition: 'Causing harm or damage', example: 'Smoking is detrimental to health.' },
      { english: 'alleviate', vietnamese: 'giảm bớt', pos: 'verb', definition: 'To make suffering less severe', example: 'Aid can alleviate poverty.' },
      { english: 'scrutinize', vietnamese: 'xem xét kỹ lưỡng', pos: 'verb', definition: 'To examine very carefully', example: 'Scrutinize the contract before signing.' },
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
      console.warn('⚠️  No ADMIN user found. Skipping explore folder seed.');
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
        required_level: folderDef.required_level,
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
      console.log(`✅ Seeded: "${folderDef.title}" (level ${folderDef.required_level}, ${folderDef.flashcards.length} cards)`);
    }
  },

  async down(queryInterface) {
    const titles = FOLDERS.map((f) => f.title);
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
