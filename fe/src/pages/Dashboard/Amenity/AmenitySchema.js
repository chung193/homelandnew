import { z } from 'zod';

export const amenitySchema = z.object({
    name: z.string().min(1, 'Tên tiện ích là bắt buộc'),
    slug: z.string().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int().default(0),
});
