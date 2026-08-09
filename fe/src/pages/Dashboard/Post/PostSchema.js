import { z } from 'zod';

export const postSchema = z.object({
    name: z
        .string()
        .min(2, 'Tên bài viết tối thiểu 2 ký tự'),
    slug: z.string().optional(), // Slug sẽ được handle trong component
    description: z.string().optional(),
    content: z
        .string()
        .min(1, 'Nội dung không được để trống'),
    status: z
        .string()
        .min(1, 'Trạng thái không được để trống'),
    type: z
        .string()
        .min(1, 'Loại không được để trống'),
    category_id: z.coerce.number().int(),
    views: z.coerce.number().optional(),
    published_at: z
        .string()
        .min(1, 'Ngày đăng không được để trống'),
    featured: z.coerce
        .boolean(),
    allow_comments: z.coerce
        .boolean(),
    tags: z.array(z.union([z.string(), z.number()])).optional(),
});
