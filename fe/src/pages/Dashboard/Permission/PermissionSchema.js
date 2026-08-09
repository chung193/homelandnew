import { z } from 'zod';

export const permissionSchema = z.object({
    name: z
        .string()
        .min(2, 'Tên quyền tối thiểu 2 ký tự')
        .max(50, 'Tên quyền tối đa 50 ký tự'),

    guard_name: z
        .string()
        .min(1, 'Guard name không được để trống'),

    description: z.string().optional(),
});
