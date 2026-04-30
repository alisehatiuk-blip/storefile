import { eq, and, gt } from 'drizzle-orm';
import { getDb } from '../../db';
import { users, refreshTokens, NewUser, User, NewRefreshToken } from '../../db/schema';

export class AuthRepository {
  private get db() {
    return getDb();
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return results[0];
  }

  async findUserById(id: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return results[0];
  }

  async createUser(data: NewUser): Promise<void> {
    await this.db.insert(users).values(data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await this.db.update(users).set(data).where(eq(users.id, id));
  }

  async createRefreshToken(data: NewRefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values(data);
  }

  async findRefreshToken(token: string) {
    const results = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);
    return results[0];
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, token));
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  async findByVerificationToken(token: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);
    return results[0];
  }

  async findByPasswordResetToken(token: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetExpires, new Date())
        )
      )
      .limit(1);
    return results[0];
  }
}
