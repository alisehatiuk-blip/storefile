import { v4 as uuidv4 } from 'uuid';
import { FastifyInstance } from 'fastify';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';
import { hashPassword, comparePassword, generateToken } from '../../utils/crypto';
import { env } from '../../config/env';

export class AuthService {
  private repo: AuthRepository;

  constructor(private fastify: FastifyInstance) {
    this.repo = new AuthRepository();
  }

  async register(input: RegisterInput) {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new Error('این ایمیل قبلاً ثبت شده است');
    }

    const hashedPassword = await hashPassword(input.password);
    const verificationToken = generateToken(32);

    const userId = uuidv4();
    await this.repo.createUser({
      id: userId,
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });

    // In production: send verification email
    // For now, auto-verify in development
    if (env.NODE_ENV === 'development') {
      await this.repo.updateUser(userId, {
        isEmailVerified: true,
        emailVerificationToken: undefined,
      });
    }

    const user = await this.repo.findUserById(userId);
    if (!user) throw new Error('خطا در ایجاد حساب کاربری');

    return this.generateTokenPair(user);
  }

  async login(input: LoginInput) {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) {
      throw new Error('ایمیل یا رمز عبور اشتباه است');
    }

    if (!user.isActive) {
      throw new Error('حساب کاربری شما غیرفعال شده است');
    }

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) {
      throw new Error('ایمیل یا رمز عبور اشتباه است');
    }

    await this.repo.updateUser(user.id, { lastLoginAt: new Date() });

    return this.generateTokenPair(user);
  }

  async refreshToken(token: string) {
    const storedToken = await this.repo.findRefreshToken(token);
    if (!storedToken) {
      throw new Error('توکن نامعتبر یا منقضی شده است');
    }

    const user = await this.repo.findUserById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new Error('کاربر یافت نشد');
    }

    await this.repo.revokeRefreshToken(token);
    return this.generateTokenPair(user);
  }

  async logout(userId: string) {
    await this.repo.revokeAllUserRefreshTokens(userId);
  }

  async verifyEmail(token: string) {
    const user = await this.repo.findByVerificationToken(token);
    if (!user) {
      throw new Error('توکن تایید ایمیل نامعتبر است');
    }

    await this.repo.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
    });
  }

  async forgotPassword(email: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) return; // Silent fail for security

    const resetToken = generateToken(32);
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.repo.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: expires,
    });

    // In production: send reset email
    return resetToken; // Return for mock/dev purposes
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.repo.findByPasswordResetToken(token);
    if (!user) {
      throw new Error('توکن بازیابی رمز عبور نامعتبر یا منقضی شده است');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.repo.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    await this.repo.revokeAllUserRefreshTokens(user.id);
  }

  private async generateTokenPair(user: { id: string; email: string; role: string }) {
    const payload = { userId: user.id, email: user.email, role: user.role };

    const accessToken = this.fastify.jwt.sign(payload, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshTokenValue = generateToken(64);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.repo.createRefreshToken({
      id: uuidv4(),
      userId: user.id,
      token: refreshTokenValue,
      expiresAt,
      isRevoked: false,
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
