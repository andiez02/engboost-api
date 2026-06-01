import { Op } from 'sequelize';
import User from '../src/models/User';
import Notification from '../src/models/Notification';
import sequelize from '../src/config/sequelize';

async function seedNotifications() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // 1. Seed welcome notification for ALL accounts
    console.log('Fetching all users...');
    const allUsers = await User.findAll();
    console.log(`Found ${allUsers.length} users.`);

    const welcomeNotifs = allUsers.map((user) => ({
      user_id: user.id,
      type: 'SYSTEM',
      title: 'Chào mừng bạn đến với EngBoost! 🚀',
      message: 'Cảm ơn bạn đã tham gia cộng đồng EngBoost. Hãy bắt đầu ôn tập Flashcard mỗi ngày để đạt được mục tiêu tiếng Anh của mình nhé!',
      is_read: false
    }));

    if (welcomeNotifs.length > 0) {
      await Notification.bulkCreate(welcomeNotifs);
      console.log(`Seeded welcome messages for ${welcomeNotifs.length} users.`);
    }

    // 2. Seed miss streak warning for andiez02@yopmail.com
    const andiez = await User.findOne({ where: { email: 'andiez02@yopmail.com' } });
    if (andiez) {
      await Notification.create({
        user_id: andiez.id,
        type: 'STREAK_WARNING',
        title: 'Cảnh báo mất chuỗi! 🔥',
        message: 'Chú ý! Bạn chưa hoàn thành bài ôn tập ngày hôm nay. Đừng để chuỗi học tập của bạn bị đứt đoạn nhé!',
        is_read: false
      });
      console.log(`Seeded miss streak warning for ${andiez.email}.`);
    } else {
      console.log('User andiez02@yopmail.com not found.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedNotifications();
