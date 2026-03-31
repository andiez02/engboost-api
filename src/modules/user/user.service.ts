import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../../config/cloudinary';
import { User } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { JwtProvider } from '../../utils/jwtProvider';

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
      verify_token: uuidv4(),
    });

    // TODO: Send verification email via Brevo

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
}

export const userService = new UserService();
