import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersRepository } from '../repositories/users';
import { signupSchema, loginSchema, insertUserSchema } from '../db/schema';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'finguard-secret-key-2026';

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { name, email, password, role } = parsed.data as { name: string; email: string; password: string; role: string; confirmPassword: string };

    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: '该邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await usersRepository.create(
      insertUserSchema.parse({ name, email, password: hashedPassword, role })
    );

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { email, password } = parsed.data;

    const user = await usersRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: '账号已被禁用，请联系管理员' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    const user = await usersRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    return res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone, createdAt: user.createdAt },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    const { name, department, phone } = req.body;
    const updated = await usersRepository.update(userId, { name, department, phone });
    if (!updated) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    return res.json({
      success: true,
      data: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, department: updated.department, phone: updated.phone },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '密码参数不合法' });
    }
    const user = await usersRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    await usersRepository.update(userId, { password: hashed });
    return res.json({ success: true, data: { message: '密码修改成功' } });
  } catch (error) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
