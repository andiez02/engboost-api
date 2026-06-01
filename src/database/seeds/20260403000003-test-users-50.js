'use strict';

const { v4: uuidv4 } = require('uuid');

// Password: Test@123 (bcrypt, cost 10)
const PASSWORD_HASH = '$2a$10$32SkzNLXhMXf0bB2ZctZQOfLyyLeKBdO1W7dZtvZMJWoRzs0zl5k.';

const NOW = new Date();

const USERS = [
  { username: 'bao_trinh',     email: 'bao_trinh@test.com',    xp: 5100, weekly_xp: 1200, level: 25, streak: 30 },
  { username: 'cam_ly',        email: 'cam_ly@test.com',       xp: 4900, weekly_xp: 1150, level: 24, streak: 28 },
  { username: 'dang_khoa',     email: 'dang_khoa@test.com',    xp: 4700, weekly_xp: 1080, level: 23, streak: 22 },
  { username: 'em_hoa',        email: 'em_hoa@test.com',       xp: 4500, weekly_xp: 1010, level: 22, streak: 19 },
  { username: 'gia_bao',       email: 'gia_bao@test.com',      xp: 4300, weekly_xp:  960, level: 21, streak: 17 },
  { username: 'ha_linh',       email: 'ha_linh@test.com',      xp: 4100, weekly_xp:  900, level: 20, streak: 15 },
  { username: 'hung_anh',      email: 'hung_anh@test.com',     xp: 3900, weekly_xp:  850, level: 19, streak: 13 },
  { username: 'kim_chi',       email: 'kim_chi@test.com',      xp: 3700, weekly_xp:  800, level: 18, streak: 11 },
  { username: 'long_vu',       email: 'long_vu@test.com',      xp: 3500, weekly_xp:  740, level: 17, streak: 10 },
  { username: 'my_duyen',      email: 'my_duyen@test.com',     xp: 3300, weekly_xp:  690, level: 16, streak: 8  },
  { username: 'nam_khanh',     email: 'nam_khanh@test.com',    xp: 3100, weekly_xp:  640, level: 15, streak: 7  },
  { username: 'oanh_yen',      email: 'oanh_yen@test.com',     xp: 2950, weekly_xp:  600, level: 15, streak: 6  },
  { username: 'phuong_anh',    email: 'phuong_anh@test.com',   xp: 2800, weekly_xp:  560, level: 14, streak: 5  },
  { username: 'quoc_bao',      email: 'quoc_bao@test.com',     xp: 2650, weekly_xp:  520, level: 13, streak: 4  },
  { username: 'rong_viet',     email: 'rong_viet@test.com',    xp: 2500, weekly_xp:  480, level: 13, streak: 3  },
  { username: 'son_tung',      email: 'son_tung@test.com',     xp: 2350, weekly_xp:  440, level: 12, streak: 9  },
  { username: 'thao_nhi',      email: 'thao_nhi@test.com',     xp: 2200, weekly_xp:  400, level: 12, streak: 8  },
  { username: 'uyen_thy',      email: 'uyen_thy@test.com',     xp: 2050, weekly_xp:  370, level: 11, streak: 6  },
  { username: 'van_duc',       email: 'van_duc@test.com',      xp: 1900, weekly_xp:  340, level: 11, streak: 5  },
  { username: 'xuan_mai',      email: 'xuan_mai@test.com',     xp: 1750, weekly_xp:  310, level: 10, streak: 4  },
  { username: 'yen_nhi',       email: 'yen_nhi@test.com',      xp: 1600, weekly_xp:  280, level: 9,  streak: 3  },
  { username: 'an_khang',      email: 'an_khang@test.com',     xp: 1480, weekly_xp:  255, level: 9,  streak: 2  },
  { username: 'binh_minh',     email: 'binh_minh@test.com',    xp: 1360, weekly_xp:  230, level: 8,  streak: 1  },
  { username: 'chau_giang',    email: 'chau_giang@test.com',   xp: 1240, weekly_xp:  205, level: 8,  streak: 0  },
  { username: 'dieu_linh',     email: 'dieu_linh@test.com',    xp: 1120, weekly_xp:  180, level: 7,  streak: 5  },
  { username: 'gia_han',       email: 'gia_han@test.com',      xp: 1000, weekly_xp:  160, level: 7,  streak: 4  },
  { username: 'hoai_nam',      email: 'hoai_nam@test.com',     xp:  900, weekly_xp:  140, level: 6,  streak: 3  },
  { username: 'ich_nhan',      email: 'ich_nhan@test.com',     xp:  810, weekly_xp:  120, level: 6,  streak: 2  },
  { username: 'kieu_oanh',     email: 'kieu_oanh@test.com',    xp:  720, weekly_xp:  105, level: 5,  streak: 1  },
  { username: 'lam_son',       email: 'lam_son@test.com',      xp:  640, weekly_xp:   90, level: 5,  streak: 0  },
  { username: 'minh_quan',     email: 'minh_quan@test.com',    xp:  560, weekly_xp:   78, level: 4,  streak: 7  },
  { username: 'ngoc_bich',     email: 'ngoc_bich@test.com',    xp:  490, weekly_xp:   66, level: 4,  streak: 6  },
  { username: 'oanh_trang',    email: 'oanh_trang@test.com',   xp:  420, weekly_xp:   55, level: 3,  streak: 5  },
  { username: 'phi_long',      email: 'phi_long@test.com',     xp:  360, weekly_xp:   46, level: 3,  streak: 4  },
  { username: 'quynh_anh',     email: 'quynh_anh@test.com',    xp:  300, weekly_xp:   38, level: 3,  streak: 3  },
  { username: 'rac_ket',       email: 'rac_ket@test.com',      xp:  250, weekly_xp:   31, level: 2,  streak: 2  },
  { username: 'sang_nguyen',   email: 'sang_nguyen@test.com',  xp:  200, weekly_xp:   25, level: 2,  streak: 1  },
  { username: 'tam_an',        email: 'tam_an@test.com',       xp:  160, weekly_xp:   20, level: 2,  streak: 0  },
  { username: 'uoc_mo',        email: 'uoc_mo@test.com',       xp:  120, weekly_xp:   15, level: 1,  streak: 3  },
  { username: 'viet_hung',     email: 'viet_hung@test.com',    xp:   90, weekly_xp:   11, level: 1,  streak: 2  },
  { username: 'xuan_truong',   email: 'xuan_truong@test.com',  xp:   65, weekly_xp:    8, level: 1,  streak: 1  },
  { username: 'yen_bai',       email: 'yen_bai@test.com',      xp:   45, weekly_xp:    5, level: 1,  streak: 0  },
  { username: 'anh_tuan',      email: 'anh_tuan@test.com',     xp:   30, weekly_xp:    3, level: 1,  streak: 0  },
  { username: 'bach_tuyet',    email: 'bach_tuyet@test.com',   xp:   20, weekly_xp:    2, level: 1,  streak: 0  },
  { username: 'co_tam',        email: 'co_tam@test.com',       xp:   15, weekly_xp:    1, level: 1,  streak: 0  },
  { username: 'dai_bang',      email: 'dai_bang@test.com',     xp:   10, weekly_xp:    1, level: 1,  streak: 0  },
  { username: 'em_be',         email: 'em_be@test.com',        xp:    5, weekly_xp:    0, level: 1,  streak: 0  },
  { username: 'fan_cuong',     email: 'fan_cuong@test.com',    xp:    3, weekly_xp:    0, level: 1,  streak: 0  },
  { username: 'gao_nep',       email: 'gao_nep@test.com',      xp:    2, weekly_xp:    0, level: 1,  streak: 0  },
  { username: 'hat_sen',       email: 'hat_sen@test.com',      xp:    1, weekly_xp:    0, level: 1,  streak: 0  },
  { username: 'im_lang',       email: 'im_lang@test.com',      xp:    0, weekly_xp:    0, level: 1,  streak: 0  },
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
      last_study_date: u.streak > 0 ? NOW : null,
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
