import { z } from 'zod';

export const pageSchema = z.object({
    name: z
        .string()
        .min(2, 'Tên trang tối thiểu 2 ký tự')
        .max(50, 'Tên trang tối đa 50 ký tự'),
    description: z
        .string()
        .min(1, 'Mô tả không được để trống'),
    content: z
        .string()
        .min(1, 'Nội dung không được để trống'),
    slug: z
        .string()
        .min(1, 'Slug không được để trống'),
    status: z
        .string()
        .min(1, 'Trạng thái không được để trống'),
    type: z
        .string()
        .min(1, 'Loại không được để trống'),
    views: z.coerce
        .number()
        .int()
        .min(0, 'Lượt xem không hợp lệ'),
    published_at: z
        .string()
        .min(1, 'Ngày đăng không được để trống'),
    featured: z.coerce
        .boolean(),
    allow_comments: z.coerce
        .boolean(),
});
