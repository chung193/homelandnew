import { z } from 'zod';

export const propertyTypeSchema = z.object({
    name: z.string().min(1, 'Tên loại bất động sản là bắt buộc'),
    slug: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int().default(0),
    amenity_ids: z.array(z.number()).optional().default([]),
});
