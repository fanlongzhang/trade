import { z } from 'zod';
import { insertUserSchema } from '../db/schema';

// 内存数据库
let users: any[] = [
    // 预创建的测试用户
    {
        id: 1,
        name: '管理员',
        email: 'admin@example.com',
        password: 'admin123', // 明文密码，方便测试
        role: 'admin',
        department: 'IT部门',
        phone: '13800138000',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        name: '财务人员',
        email: 'finance@example.com',
        password: 'finance123', // 明文密码，方便测试
        role: 'financial_staff',
        department: '财务部',
        phone: '13900139000',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

let nextId = 3;

export const usersRepository = {
    async findByEmail(email: string): Promise<any | null> {
        const user = users.find(u => u.email === email);
        return user || null;
    },

    async findById(id: number): Promise<any | null> {
        const user = users.find(u => u.id === id);
        return user || null;
    },

    async create(userData: z.infer<typeof insertUserSchema>): Promise<any> {
        const newUser = {
            id: nextId++,
            ...userData,
            isActive: userData.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.push(newUser);
        return newUser;
    },

    async update(id: number, userData: Partial<z.infer<typeof insertUserSchema>>): Promise<any | null> {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date()
        };
        return users[index];
    },

    async findAll(): Promise<any[]> {
        return users;
    },

    async toggleActive(id: number, isActive: boolean): Promise<any | null> {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            isActive,
            updatedAt: new Date()
        };
        return users[index];
    },
};