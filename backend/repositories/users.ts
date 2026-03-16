import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { users, type User, type InsertUser } from '../db/schema';
import { z } from 'zod';
import { insertUserSchema } from '../db/schema';

export const usersRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] ?? null;
  },

  async create(userData: z.infer<typeof insertUserSchema>): Promise<User> {
    const result = await db.insert(users).values(userData as InsertUser).returning();
    return result[0];
  },

  async update(id: number, userData: Partial<z.infer<typeof insertUserSchema>>): Promise<User | null> {
    const result = await db
      .update(users)
      .set({ ...userData as Partial<InsertUser>, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  },

  async findAll(): Promise<User[]> {
    return db.select().from(users);
  },

  async toggleActive(id: number, isActive: boolean): Promise<User | null> {
    const result = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  },
};
