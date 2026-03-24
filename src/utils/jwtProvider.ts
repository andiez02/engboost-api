import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { env } from '../config/environment';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class JwtProvider {
  static generateToken(
    userInfo: TokenPayload,
    secretSignature: string,
    tokenLife: string | number
  ): string {
    return jwt.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife as StringValue,
    });
  }

  static verifyToken(token: string, secretSignature: string): TokenPayload {
    return jwt.verify(token, secretSignature) as TokenPayload;
  }

  static generateAccessToken(userInfo: TokenPayload): string {
    return this.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_LIFE
    );
  }

  static generateRefreshToken(userInfo: TokenPayload): string {
    return this.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET,
      env.REFRESH_TOKEN_LIFE
    );
  }
}
