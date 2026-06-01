'use strict';

const { v4: uuidv4 } = require('uuid');

// Password: Test@123 (bcrypt, cost 10)
const PASSWORD_HASH = '$2a$10$32SkzNLXhMXf0bB2ZctZQOfLyyLeKBdO1W7dZtvZMJWoRzs0zl5k.';

const NOW = new Date();

const USERS = [
  { username: 'hieu_nguyen',  email: 'hieu@test.com',   xp: 3200, weekly_xp: 820, level: 18, streak: 14 },
  { username: 'linh_tran',    email: 'linh@test.com',   xp: 2900, weekly_xp: 750, level: 16, streak: 9  },
  { username: 'minh_le',      email: 'minh@test.com',   xp: 2500, weekly_xp: 610, level: 14, streak: 21 },
  { username: 'thu_pham',     email: 'thu@test.com',    xp: 2100, weekly_xp: 540, level: 12, streak: 5  },
  { username: 'duc_hoang',    email: 'duc@test.com',    xp: 1800, weekly_xp: 430, level: 10, streak: 7  },
  { username: 'mai_vu',       email: 'mai@test.com',    xp: 1500, weekly_xp: 380, level: 9,  streak: 3  },
  { username: 'tuan_bui',     email: 'tuan@test.com',   xp: 1200, weekly_xp: 290, level: 7,  streak: 12 },
  { username: 'lan_do',       email: 'lan@test.com',    xp:  900, weekly_xp: 210, level: 6,  streak: 2  },
  { username: 'khoa_ngo',     email: 'khoa@test.com',   xp:  600, weekly_xp: 140, level: 4,  streak: 0  },
  { username: 'huong_dinh',   email: 'huong@test.com',  xp:  300, weekly_xp:  60, level: 2,  streak: 1  },
];

module.exports = {
  async up(queryInterface) {
    const rows = USERS.map((u) => ({
      id: uuidv4(),
      email: u.email,
      password: PASSWORD_HASH,
      username: u.username,
      avatar: null,
      role: 'CLIENT',
      is_active: true,
      verify_token: null,
      streak: u.streak,
      last_study_date: NOW,
      daily_goal: 20,
      total_reviewed: Math.floor(u.xp / 10),
      xp: u.xp,
      weekly_xp: u.weekly_xp,
      level: u.level,
      created_at: NOW,
      updated_at: NOW,
    }));

    await queryInterface.bulkInsert('users', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: USERS.map((u) => u.email),
    });
  },
};
