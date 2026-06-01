import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../../config/cloudinary';
import { User } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { JwtProvider } from '../../utils/jwtProvider';
import ExcelJS from 'exceljs';

const SALT_ROUNDS = 10;

export class UserService {
  /**
   * Register a new user
   */
  async register(data: { email: string; password: string }) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ApiError(409, 'Email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const newUser = await User.create({
      email: data.email,
      password: hashedPassword,
      username: data.email.split('@')[0], // Default username from email
      is_active: true,
      verify_token: null,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };
  }

  /**
   * Verify user account
   */
  async verify(data: { email: string; token: string }) {
    const user = await User.findOne({
      where: { email: data.email, verify_token: data.token },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid verification token or email.');
    }

    if (user.is_active) {
      throw new ApiError(400, 'Account is already verified.');
    }

    await user.update({ is_active: true, verify_token: null });

    return { message: 'Account verified successfully.' };
  }

  /**
   * Login
   */
  async login(data: { email: string; password: string }) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.is_active) {
      throw new ApiError(403, 'Your account is not verified. Please check your email.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Generate tokens
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = JwtProvider.generateAccessToken(tokenPayload);
    const refreshToken = JwtProvider.generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken, user: tokenPayload };
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string) {
    const decoded = JwtProvider.verifyToken(refreshToken, '');
    // We need the actual secret, let's import env
    const { env } = await import('../../config/environment');
    const verified = JwtProvider.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);

    const user = await User.findByPk(verified.id);
    if (!user) {
      throw new ApiError(401, 'User not found.');
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = JwtProvider.generateAccessToken(tokenPayload);

    return { accessToken: newAccessToken };
  }

  /**
   * Get user by ID
   */
  async getById(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verify_token'] },
    });

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    return user;
  }

  /**
   * Get all achievements for a user (unlocked + locked)
   */
  async getAchievements(userId: string) {
    const { Achievement, UserAchievement } = await import('../../models');

    const [allAchievements, userAchievements] = await Promise.all([
      Achievement.findAll({ order: [['created_at', 'ASC']] }),
      UserAchievement.findAll({ where: { user_id: userId } }),
    ]);

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievement_id, ua.unlocked_at])
    );

    return allAchievements.map((a) => ({
      id: a.id,
      key: a.key,
      title: a.title,
      description: a.description,
      icon: a.icon,
      unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) ?? null,
    }));
  }

 

  async update(
    userId: string,
    updateData: {
      username?: string;
      avatar?: string | null;
      current_password?: string;
      new_password?: string;
    },
    avatarFile?: Express.Multer.File
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found.');

    const changes: Record<string, unknown> = {};

    // Username update
    if (updateData.username !== undefined) {
      changes.username = updateData.username;
    }

    // Avatar upload via Cloudinary
    if (avatarFile) {
      const b64 = Buffer.from(avatarFile.buffer).toString('base64');
      const dataUri = `data:${avatarFile.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'engboost/avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill' }],
      });
      changes.avatar = result.secure_url;
    } else if (updateData.avatar !== undefined) {
      changes.avatar = updateData.avatar;
    }

    // Password change
    if (updateData.new_password) {
      if (!updateData.current_password) {
        throw new ApiError(400, 'Current password is required.');
      }
      const isValid = await bcrypt.compare(updateData.current_password, user.password);
      if (!isValid) throw new ApiError(400, 'Current password is incorrect.');
      changes.password = await bcrypt.hash(updateData.new_password, SALT_ROUNDS);
    }

    await user.update(changes);

    const { password, verify_token, ...safeUser } = user.toJSON();
    return safeUser;
  }

   // ─── Admin methods ────────────────────────────────────────────────────────

  async listUsers(
    page: number,
    limit: number,
    filters: {
      search?: string;
      role?: string;
      isActive?: boolean;
      minLevel?: number;
      inactiveDays?: number;
      sortBy?: string;
      sortOrder?: string;
    }
  ) {
    const { Op } = await import('sequelize');
    const offset = (page - 1) * limit;
    const search = filters.search || '';
    const allowedSortBy: Record<string, string> = {
      createdAt: 'created_at',
      level: 'level',
      xp: 'xp',
      streak: 'streak',
      lastStudyDate: 'last_study_date',
    };
    const sortColumn = allowedSortBy[filters.sortBy || 'createdAt'] || 'created_at';
    const sortDirection = (filters.sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where: any = search
      ? {
          [Op.or]: [
            { username: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    if (filters.role === 'ADMIN' || filters.role === 'CLIENT') {
      where.role = filters.role;
    }
    if (typeof filters.isActive === 'boolean') {
      where.is_active = filters.isActive;
    }
    if (typeof filters.minLevel === 'number' && !Number.isNaN(filters.minLevel)) {
      where.level = { [Op.gte]: filters.minLevel };
    }
    if (typeof filters.inactiveDays === 'number' && !Number.isNaN(filters.inactiveDays) && filters.inactiveDays > 0) {
      const inactiveSince = new Date();
      inactiveSince.setDate(inactiveSince.getDate() - filters.inactiveDays);
      where[Op.or] = [
        { last_study_date: null },
        { last_study_date: { [Op.lt]: inactiveSince } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'verify_token'] },
      order: [[sortColumn, sortDirection]],
      limit,
      offset,
    });

    const [activeUsers, inactiveUsers, adminUsers, clientUsers] = await Promise.all([
      User.count({ where: { ...where, is_active: true } }),
      User.count({ where: { ...where, is_active: false } }),
      User.count({ where: { ...where, role: 'ADMIN' } }),
      User.count({ where: { ...where, role: 'CLIENT' } }),
    ]);

    return {
      users: rows.map((u) => {
        const user = u.toJSON();
        return {
          ...user,
          _id: user.id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          isActive: user.is_active,
          lastStudyDate: user.last_study_date,
          totalReviewed: user.total_reviewed,
          dailyGoal: user.daily_goal,
          weeklyXp: user.weekly_xp,
        };
      }),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      summary: {
        total: count,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
        clients: clientUsers,
      },
    };
  }

  async exportUsers(filters: {
    search?: string;
    role?: string;
    isActive?: boolean;
    minLevel?: number;
    inactiveDays?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { Op } = await import('sequelize');
    const search = filters.search || '';
    const allowedSortBy: Record<string, string> = {
      createdAt: 'created_at',
      level: 'level',
      xp: 'xp',
      streak: 'streak',
      lastStudyDate: 'last_study_date',
    };
    const sortColumn = allowedSortBy[filters.sortBy || 'createdAt'] || 'created_at';
    const sortDirection = (filters.sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where: any = search
      ? {
          [Op.or]: [
            { username: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    if (filters.role === 'ADMIN' || filters.role === 'CLIENT') {
      where.role = filters.role;
    }
    if (typeof filters.isActive === 'boolean') {
      where.is_active = filters.isActive;
    }
    if (typeof filters.minLevel === 'number' && !Number.isNaN(filters.minLevel)) {
      where.level = { [Op.gte]: filters.minLevel };
    }
    if (typeof filters.inactiveDays === 'number' && !Number.isNaN(filters.inactiveDays) && filters.inactiveDays > 0) {
      const inactiveSince = new Date();
      inactiveSince.setDate(inactiveSince.getDate() - filters.inactiveDays);
      where[Op.or] = [
        { last_study_date: null },
        { last_study_date: { [Op.lt]: inactiveSince } },
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password', 'verify_token'] },
      order: [[sortColumn, sortDirection]],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EngBoost';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Users');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Username', key: 'username', width: 18 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Active', key: 'is_active', width: 10 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'XP', key: 'xp', width: 12 },
      { header: 'Weekly XP', key: 'weekly_xp', width: 12 },
      { header: 'Streak', key: 'streak', width: 10 },
      { header: 'Total Reviewed', key: 'total_reviewed', width: 14 },
      { header: 'Daily Goal', key: 'daily_goal', width: 12 },
      { header: 'Last Study Date', key: 'last_study_date', width: 16 },
      { header: 'Created At', key: 'created_at', width: 16 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    users.forEach((u) => {
      const user = u.toJSON() as any;
      sheet.addRow({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_active: user.is_active ? 'TRUE' : 'FALSE',
        level: user.level ?? 1,
        xp: user.xp ?? 0,
        weekly_xp: user.weekly_xp ?? 0,
        streak: user.streak ?? 0,
        total_reviewed: user.total_reviewed ?? 0,
        daily_goal: user.daily_goal ?? 0,
        last_study_date: user.last_study_date ? new Date(user.last_study_date).toISOString().slice(0, 10) : '',
        created_at: user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : '',
      });
    });

    const now = new Date();
    const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const filename = `engboost-users-${stamp}.xlsx`;
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer);

    return { buffer, filename };
  }

  async getUserAnalytics(rangeDays: number) {
    const { Op } = await import('sequelize');
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (rangeDays - 1));

    const [totalUsers, activeUsers, adminUsers, usersInRange, topXpUsers, topStreakUsers] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      User.count({ where: { role: 'ADMIN' } }),
      User.findAll({
        where: { created_at: { [Op.gte]: startDate } },
        attributes: ['id', 'created_at', 'is_active', 'level'],
        order: [['created_at', 'ASC']],
      }),
      User.findAll({
        attributes: ['id', 'username', 'email', 'xp', 'level'],
        order: [['xp', 'DESC']],
        limit: 10,
      }),
      User.findAll({
        attributes: ['id', 'username', 'email', 'streak', 'level'],
        order: [['streak', 'DESC']],
        limit: 10,
      }),
    ]);

    const growthMap = new Map<string, { date: string; newUsers: number; activeUsers: number; inactiveUsers: number }>();
    for (let i = 0; i < rangeDays; i += 1) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      growthMap.set(key, { date: key, newUsers: 0, activeUsers: 0, inactiveUsers: 0 });
    }

    usersInRange.forEach((u) => {
      const user = u.toJSON() as { created_at: Date; is_active: boolean; level: number };
      const key = new Date(user.created_at).toISOString().slice(0, 10);
      const row = growthMap.get(key);
      if (!row) return;
      row.newUsers += 1;
      if (user.is_active) row.activeUsers += 1;
      else row.inactiveUsers += 1;
    });

    const [level1To5, level6To10, level11To20, level21Plus] = await Promise.all([
      User.count({ where: { level: { [Op.between]: [1, 5] } } }),
      User.count({ where: { level: { [Op.between]: [6, 10] } } }),
      User.count({ where: { level: { [Op.between]: [11, 20] } } }),
      User.count({ where: { level: { [Op.gte]: 21 } } }),
    ]);

    const growth = Array.from(growthMap.values()).map((row) => ({
      ...row,
      activationRate: row.newUsers > 0 ? Number(((row.activeUsers / row.newUsers) * 100).toFixed(2)) : 0,
    }));

    const now = new Date();
    const day7 = new Date(now);
    day7.setDate(now.getDate() - 7);
    const day14 = new Date(now);
    day14.setDate(now.getDate() - 14);
    const day30 = new Date(now);
    day30.setDate(now.getDate() - 30);
    const day60 = new Date(now);
    day60.setDate(now.getDate() - 60);

    const [inactive7Plus, inactive14Plus, inactive30Plus, inactive60Plus, neverStudied] = await Promise.all([
      User.count({ where: { [Op.or]: [{ last_study_date: null }, { last_study_date: { [Op.lt]: day7 } }] } }),
      User.count({ where: { [Op.or]: [{ last_study_date: null }, { last_study_date: { [Op.lt]: day14 } }] } }),
      User.count({ where: { [Op.or]: [{ last_study_date: null }, { last_study_date: { [Op.lt]: day30 } }] } }),
      User.count({ where: { [Op.or]: [{ last_study_date: null }, { last_study_date: { [Op.lt]: day60 } }] } }),
      User.count({ where: { last_study_date: null } }),
    ]);

    const totalNewUsers = growth.reduce((sum, row) => sum + row.newUsers, 0);
    const totalNewActiveUsers = growth.reduce((sum, row) => sum + row.activeUsers, 0);
    const overallActivationRate = totalNewUsers > 0
      ? Number(((totalNewActiveUsers / totalNewUsers) * 100).toFixed(2))
      : 0;

    return {
      roleBreakdown: [
        { name: 'Admin', value: adminUsers },
        { name: 'Client', value: Math.max(totalUsers - adminUsers, 0) },
      ],
      levelDistribution: [
        { range: 'Lv 1-5', count: level1To5 },
        { range: 'Lv 6-10', count: level6To10 },
        { range: 'Lv 11-20', count: level11To20 },
        { range: 'Lv 21+', count: level21Plus },
      ],
      growth,
      inactiveBuckets: [
        { label: '7+ ngày', count: inactive7Plus },
        { label: '14+ ngày', count: inactive14Plus },
        { label: '30+ ngày', count: inactive30Plus },
        { label: '60+ ngày', count: inactive60Plus },
        { label: 'Chưa từng học', count: neverStudied },
      ],
      topXpUsers: topXpUsers.map((u) => {
        const user = u.toJSON() as { id: string; username: string; email: string; xp: number; level: number };
        return {
          id: user.id,
          username: user.username || user.email,
          xp: user.xp ?? 0,
          level: user.level ?? 1,
        };
      }),
      topStreakUsers: topStreakUsers.map((u) => {
        const user = u.toJSON() as { id: string; username: string; email: string; streak: number; level: number };
        return {
          id: user.id,
          username: user.username || user.email,
          streak: user.streak ?? 0,
          level: user.level ?? 1,
        };
      }),
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(totalUsers - activeUsers, 0),
        totalNewUsers,
        totalNewActiveUsers,
        overallActivationRate,
      },
    };
  }

  async updateRole(userId: string, role: 'CLIENT' | 'ADMIN') {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found.');
    if (user.email === 'admin@yopmail.com') throw new ApiError(403, 'Cannot modify the root admin account.');
    await user.update({ role });
    return { message: 'Role updated successfully.' };
  }

  async deleteUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found.');
    if (user.role === 'ADMIN') throw new ApiError(403, 'Cannot delete an admin account.');
    await user.destroy();
    return { message: 'User deleted successfully.' };
  }
}

export const userService = new UserService();
