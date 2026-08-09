import { z } from 'zod';

export const userSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Tên người dùng tối thiểu 2 ký tự')
            .max(50, 'Tên người dùng tối đa 50 ký tự'),

        email: z
            .string()
            .min(1, 'Email không được để trống')
            .email('Email không hợp lệ'),

        password: z
            .string()
            .min(2, 'Mật khẩu tối thiểu 2 ký tự')
            .max(50, 'Mật khẩu tối đa 50 ký tự'),

        password_confirmation: z
            .string()
            .min(2, 'Xác nhận mật khẩu tối thiểu 2 ký tự')
            .max(50, 'Xác nhận mật khẩu tối đa 50 ký tự'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Xác nhận mật khẩu không khớp',
        path: ['password_confirmation'],
    });
