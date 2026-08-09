import { z } from "zod";

export const tagSchema = z.object({
    name: z
        .string()
        .min(2, "Tên tag tối thiểu 2 ký tự")
        .max(100, "Tên tag tối đa 100 ký tự"),
    slug: z
        .string()
        .max(120, "Slug toi da 120 ky tu")
        .optional(),
});
