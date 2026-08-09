import { z } from 'zod';

export const propertySchema = z.object({
    property_type_id: z.coerce.number({ invalid_type_error: 'Vui lòng chọn loại bất động sản' }).min(1, 'Vui lòng chọn loại bất động sản'),
    listing_type: z.enum(['sale', 'rent'], { required_error: 'Vui lòng chọn hình thức' }),
    title: z.string().min(1, 'Tên tài sản là bắt buộc'),
    slug: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    address_detail: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    price: z.coerce.number().optional(),
    price_unit: z.string().optional(),
    area: z.coerce.number().optional(),
    bedrooms: z.coerce.number().int().optional(),
    bathrooms: z.coerce.number().int().optional(),
    floor: z.coerce.number().int().optional(),
    status: z.enum(['draft', 'published', 'archived', 'sold', 'rented']).default('draft'),
    is_active: z.boolean().default(true),
    amenities: z.array(z.number()).default([]),
});
