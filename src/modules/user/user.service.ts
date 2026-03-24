import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
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
   * Update user
   */
  async update(userId: string, updateData: { username?: string; avatar?: string | null }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    await user.update(updateData);

    // Return without sensitive fields
    const { password, verify_token, ...safeUser } = user.toJSON();
    return safeUser;
  }
}

export const userService = new UserService();
