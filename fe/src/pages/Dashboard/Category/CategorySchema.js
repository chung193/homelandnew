import { z } from 'zod';

export const categorySchema = z.object({
    name: z
        .string()
        .min(2, 'Tên danh mục tối thiểu 2 ký tự')
        .max(50, 'Tên danh mục tối đa 50 ký tự'),
    slug: z.string().optional(),
    parent_id: z.coerce.number().nullable().optional(),
    sort_order: z.coerce.number().optional(),
    is_active: z.coerce.boolean().optional(),
    description: z.string().optional(),
});
