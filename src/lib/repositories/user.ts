import { db } from '@/lib/db';
import type { User, CreateUserDTO, Result } from '@/types';
import { UserRole, UserStatus } from '@/types';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export const userRepository = {
  async findById(id: string): Promise<User | undefined> {
    await db.seed();
    return db.users.findById(id);
  },

  async findByEmail(email: string): Promise<User | undefined> {
    await db.seed();
    return db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async create(dto: CreateUserDTO): Promise<Result<User>> {
    await db.seed();

    const existing = await this.findByEmail(dto.email);
    if (existing) {
      return { success: false, error: new Error('Email already registered') };
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user: User = {
      id: uuid(),
      email: dto.email.toLowerCase(),
      passwordHash,
      role: UserRole.BUYER,
      profile: {
        name: dto.name,
        shippingAddresses: [],
      },
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.users.create(user);
    return { success: true, data: user };
  },

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },

  async updateLastLogin(id: string): Promise<void> {
    await db.seed();
    db.users.update(id, { lastLogin: new Date() });
  },

  async update(id: string, updates: Partial<User>): Promise<User | undefined> {
    await db.seed();
    return db.users.update(id, updates);
  },
};
