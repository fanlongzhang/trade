import { pgTable, text, timestamp, serial, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('Users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('financial_staff'),
  department: text('department'),
  phone: text('phone'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  role: z.enum(['financial_staff', 'management', 'auditor', 'admin']).default('financial_staff'),
  department: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const signupSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '确认密码至少6位'),
  role: z.enum(['financial_staff', 'management', 'auditor', 'admin']).default('financial_staff'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
