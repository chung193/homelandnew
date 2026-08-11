import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Autocomplete, Typography, Chip, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Bold, Italic, Underline, Link, Paragraph, List, ListProperties, Undo } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { propertySchema } from './PropertySchema';
import { getAmenities, getPropertyTypes, getProvinces, getWards } from './PropertyServices';
import { slugify } from '@utils/common';

const normalizePriceUnit=(value)=>{const unit=String(value||'').trim().toLowerCase();if(['month','months','monthly','tháng','thang'].includes(unit))return'month';if(['day','days','daily','ngày','ngay'].includes(unit))return'day';if(['total','m2','night'].includes(unit))return unit;return'night'};

const PropertyAddModal = ({ onSubmit, onClose, showFullCreateButton = true, initialData = null }) => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [provinceSearch, setProvinceSearch] = useState('');
    const [wardSearch, setWardSearch] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedFeaturedImage, setSelectedFeaturedImage] = useState(null);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [featuredPreviewUrl, setFeaturedPreviewUrl] = useState('');
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [typesRes, amenitiesRes, provincesRes] = await Promise.all([getPropertyTypes(), getAmenities(), getProvinces()]);
                setPropertyTypes(typesRes.data.data || []);
                setAmenities(amenitiesRes.data.data || []);
                setProvinces(provincesRes.data.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        loadOptions();
    }, []);

    useEffect(() => {
        if (!initialData?.city || provinces.length === 0) return;
        const province=provinces.find((item)=>item.name===initialData.city);
        if (province) setSelectedProvinceCode(province.code??province.id);
    }, [initialData, provinces]);

    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
            if (featuredPreviewUrl) {
                URL.revokeObjectURL(featuredPreviewUrl);
            }
        };
    }, []);

    useEffect(() => {
        if (!selectedProvinceCode) {
            setWards([]);
            return;
        }

        const loadWards = async () => {
            try {
                const res = await getWards(selectedProvinceCode);
                setWards(res.data.data || []);
            } catch (err) {
                console.error(err);
                setWards([]);
            }
        };

        loadWards();
    }, [selectedProvinceCode]);

    const {
        control,
        handleSubmit,
        register,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(propertySchema),
        defaultValues: initialData ? {
            ...initialData,
            property_type_id: initialData.property_type_id ?? '',
            price_unit: normalizePriceUnit(initialData.price_unit),
            long_term_months: initialData.long_term_months ?? '', long_term_price: initialData.long_term_price ?? '', deposit_amount: initialData.deposit_amount ?? '',
            bedrooms: initialData.bedrooms ?? '', bathrooms: initialData.bathrooms ?? '', floor: initialData.floor ?? '', area: initialData.area ?? '', price: initialData.price ?? '',
            amenities: (initialData.amenities??[]).map((item)=>Number(item.id??item)),
        } : { property_type_id:'',listing_type:'sale',title:'',slug:'',description:'',address:'',address_detail:'',city:'',district:'',ward:'',price:'',price_unit:'month',long_term_months:'',long_term_price:'',deposit_amount:'',area:'',bedrooms:'',bathrooms:'',floor:'',legal_info:'',status:'draft',is_active:true,amenities:[] },
    });

    const submitHandler = (data) => {
        const formData = new FormData();

        Object.entries({
            ...data,
            slug: data.slug || slugify(data.title),
            property_type_id: Number(data.property_type_id),
            price: data.price ? Number(data.price) : null,
            long_term_months: data.long_term_months ? Number(data.long_term_months) : null,
            long_term_price: data.long_term_price !== '' ? Number(data.long_term_price) : null,
            deposit_amount: data.deposit_amount !== '' ? Number(data.deposit_amount) : null,
            area: data.area ? Number(data.area) : null,
            bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
            bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
            floor: data.floor ? Number(data.floor) : null,
            amenities: (data.amenities || []).map((item) => Number(item)),
        }).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                if (initialData) formData.append(key, '');
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item) => formData.append(`${key}[]`, item));
                if (initialData && key === 'amenities' && value.length === 0) formData.append('clear_amenities', '1');
                return;
            }

            formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
        });

        selectedImages.forEach((file) => formData.append('images[]', file));
        if (selectedFeaturedImage) {
            formData.append('featured_image', selectedFeaturedImage);
        }
        removedImageIds.forEach((id)=>formData.append('remove_image_ids[]',id));
        if(removeFeaturedImage)formData.append('remove_featured_image','1');

        onSubmit(formData);
    };

    const getFilteredOptions = (items, searchText) => {
        const query = searchText?.trim().toLowerCase() || '';
        if (!query) {
            return items;
        }

        return items.filter((item) => String(item.name || '').toLowerCase().includes(query));
    };

    const handleProvinceChange = (event, newValue) => {
        const province = provinces.find((item) => String(item.id) === String(newValue?.id) || String(item.code) === String(newValue?.code) || String(item.name) === String(newValue?.name));
        const provinceCode = province?.code ?? province?.id ?? newValue?.code ?? newValue?.id ?? '';

        setSelectedProvinceCode(provinceCode);
        setValue('city', province?.name || newValue?.name || '', { shouldValidate: true });
        setValue('district', '', { shouldValidate: true });
        setValue('ward', '', { shouldValidate: true });
        setWards([]);
        setProvinceSearch('');
    };

    const handleWardChange = (event, newValue) => {
        const ward = wards.find((item) => String(item.id) === String(newValue?.id) || String(item.code) === String(newValue?.code) || String(item.name) === String(newValue?.name));

        setValue('ward', ward?.name || newValue?.name || '', { shouldValidate: true });
        setWardSearch('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                <Controller
                    name="property_type_id"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            size="small"
                            label={t('pages.property.form.propertyType')}
                            error={!!errors.property_type_id}
                            helperText={errors.property_type_id?.message}
                        >
                            {propertyTypes.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="listing_type"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            size="small"
                            label={t('pages.property.form.listingType')}
                            error={!!errors.listing_type}
                            helperText={errors.listing_type?.message}
                        >
                            <MenuItem value="sale">Bán</MenuItem>
                            <MenuItem value="rent">Thuê</MenuItem>
                        </TextField>
                    )}
                />

                <TextField label={t('pages.property.form.title')} fullWidth size="small" {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
                <TextField label={t('pages.property.form.slug')} fullWidth size="small" {...register('slug')} />
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t('pages.property.form.description')}
                            </Typography>
                            <Box sx={{ border: '1px solid', borderColor: errors.description ? 'error.main' : 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
                                <Box sx={{ '& .ck-editor__main': { minHeight: 280 }, '& .ck-content': { minHeight: 280, maxHeight: 420, overflowY: 'auto' } }}>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={field.value || ''}
                                        onChange={(_, editor) => field.onChange(editor.getData())}
                                        onBlur={() => field.onBlur()}
                                        config={{
                                            licenseKey: 'GPL',
                                            plugins: [Essentials, Bold, Italic, Underline, Link, Paragraph, List, ListProperties, Undo],
                                            toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'underline', '|', 'link', '|', 'bulletedList', 'numberedList'],
                                            initialData: field.value || '',
                                            placeholder: 'Nhập mô tả bất động sản...'
                                        }}
                                    />
                                </Box>
                            </Box>
                            {errors.description && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                    {errors.description.message}
                                </Typography>
                            )}
                        </Box>
                    )}
                />
                <TextField label={t('pages.property.form.address')} fullWidth size="small" {...register('address')} />
                <TextField label={t('pages.property.form.addressDetail')} fullWidth size="small" {...register('address_detail')} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                fullWidth
                                size="small"
                                options={getFilteredOptions(provinces, provinceSearch)}
                                getOptionLabel={(option) => option?.name || ''}
                                value={provinces.find((item) => item.name === field.value) || null}
                                onChange={handleProvinceChange}
                                inputValue={provinceSearch}
                                onInputChange={(event, value) => setProvinceSearch(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('pages.property.form.city')}
                                        error={!!errors.city}
                                        helperText={errors.city?.message}
                                    />
                                )}
                            />
                        )}
                    />
                    <Controller
                        name="ward"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                fullWidth
                                size="small"
                                options={getFilteredOptions(wards, wardSearch)}
                                getOptionLabel={(option) => option?.name || ''}
                                value={wards.find((item) => item.name === field.value) || null}
                                onChange={handleWardChange}
                                inputValue={wardSearch}
                                onInputChange={(event, value) => setWardSearch(value)}
                                disabled={!selectedProvinceCode}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('pages.property.form.ward')}
                                        error={!!errors.ward}
                                        helperText={errors.ward?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label={t('pages.property.form.price')} type="number" fullWidth size="small" {...register('price')} />
                    <TextField label={t('pages.property.form.priceUnit')} select fullWidth size="small" defaultValue={normalizePriceUnit(initialData?.price_unit||'month')} {...register('price_unit')}><MenuItem value="month">Tháng</MenuItem><MenuItem value="day">Ngày</MenuItem><MenuItem value="night">Đêm</MenuItem><MenuItem value="total">Tổng giá bán</MenuItem><MenuItem value="m2">Theo m²</MenuItem></TextField>
                </Stack>
                <TextField label="Thông tin pháp lý" fullWidth multiline minRows={2} size="small" {...register('legal_info')} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Ưu đãi khi thuê từ (tháng)" type="number" fullWidth size="small" inputProps={{ min: 2 }} {...register('long_term_months')} helperText="Ví dụ: từ 6 tháng" />
                    <TextField label="Giá ưu đãi mỗi tháng" type="number" fullWidth size="small" inputProps={{ min: 0 }} {...register('long_term_price')} />
                    <TextField label="Tiền đặt cọc (tùy chọn)" type="number" fullWidth size="small" inputProps={{ min: 0 }} {...register('deposit_amount')} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label={t('pages.property.form.area')} type="number" fullWidth size="small" {...register('area')} />
                    <TextField label={t('pages.property.form.bedrooms')} type="number" fullWidth size="small" {...register('bedrooms')} />
                    <TextField label={t('pages.property.form.bathrooms')} type="number" fullWidth size="small" {...register('bathrooms')} />
                    <TextField label={t('pages.property.form.floor')} type="number" fullWidth size="small" {...register('floor')} />
                </Stack>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Ảnh bất động sản
                    </Typography>
                    <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }}>
                        Chọn ảnh nhiều
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(event) => {
                                const files = Array.from(event.target.files || []);
                                const newUrls = files.map((file) => URL.createObjectURL(file));
                                setSelectedImages((prev) => [...prev, ...files]);
                                setImagePreviewUrls((prev) => [...prev, ...newUrls]);
                            }}
                        />
                    </Button>
                    <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none', ml: 1 }}>
                        Ảnh đại diện
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                if (featuredPreviewUrl) {
                                    URL.revokeObjectURL(featuredPreviewUrl);
                                }
                                setSelectedFeaturedImage(file);
                                setFeaturedPreviewUrl(file ? URL.createObjectURL(file) : '');
                            }}
                        />
                    </Button>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        {(initialData?.images??[]).filter((image)=>!removedImageIds.includes(image.id)).map((image)=><Box key={image.id} sx={{position:'relative',width:96,height:96,borderRadius:1,overflow:'hidden',border:'1px solid',borderColor:'divider'}}><Box component="img" src={image.thumb||image.url} alt={image.name||'Ảnh hiện tại'} sx={{width:'100%',height:'100%',objectFit:'cover'}}/><IconButton size="small" sx={{position:'absolute',top:4,right:4,bgcolor:'rgba(0,0,0,.6)',color:'white'}} onClick={()=>setRemovedImageIds((current)=>[...current,image.id])}><Close fontSize="small"/></IconButton></Box>)}
                        {selectedImages.map((file, index) => (
                            <Box key={`${file.name}-${index}`} sx={{ position: 'relative', width: 96, height: 96, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <Box component="img" src={imagePreviewUrls[index]} alt={file.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <IconButton
                                    size="small"
                                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                                    onClick={() => {
                                        URL.revokeObjectURL(imagePreviewUrls[index]);
                                        setSelectedImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                                        setImagePreviewUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                                    }}
                                >
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Stack>
                    {selectedFeaturedImage && (
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Ảnh đại diện: {selectedFeaturedImage.name}
                            </Typography>
                            <Box sx={{ width: 140, height: 140, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <Box component="img" src={featuredPreviewUrl} alt="Featured preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                        </Box>
                    )}
                    {!selectedFeaturedImage&&initialData?.featured_image&&!removeFeaturedImage?<Box sx={{mt:2,position:'relative',width:140,height:140}}><Box component="img" src={initialData.featured_image} alt="Ảnh đại diện hiện tại" sx={{width:'100%',height:'100%',objectFit:'cover',borderRadius:1}}/><IconButton size="small" sx={{position:'absolute',top:4,right:4,bgcolor:'rgba(0,0,0,.6)',color:'white'}} onClick={()=>setRemoveFeaturedImage(true)}><Close fontSize="small"/></IconButton></Box>:null}
                </Box>

                <Controller
                    name="amenities"
                    control={control}
                    render={({ field }) => {
                        const selectedValues = field.value || [];

                        const handleToggleAmenity = (amenityId) => {
                            const nextValues = selectedValues.includes(amenityId)
                                ? selectedValues.filter((item) => item !== amenityId)
                                : [...selectedValues, amenityId];

                            field.onChange(nextValues);
                        };

                        return (
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {t('pages.property.form.amenities')}
                                </Typography>
                                {amenities.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Không có tiện ích nào.
                                    </Typography>
                                ) : (
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {amenities.map((item) => (
                                            <FormControlLabel
                                                key={item.id}
                                                control={
                                                    <Checkbox
                                                        checked={selectedValues.includes(item.id)}
                                                        onChange={() => handleToggleAmenity(item.id)}
                                                        size="small"
                                                    />
                                                }
                                                label={item.name}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        );
                    }}
                />

                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            size="small"
                            label={t('pages.property.form.status')}
                        >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                            <MenuItem value="sold">Sold</MenuItem>
                            <MenuItem value="rented">Rented</MenuItem>
                        </TextField>
                    )}
                />

                <FormControlLabel control={<Checkbox {...register('is_active')} />} label={t('pages.property.form.isActive')} />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button type="button" variant="outlined" sx={{ textTransform: 'none' }} disabled={isSubmitting} onClick={onClose}>
                        {t('pages.property.form.close')}
                    </Button>
                    {showFullCreateButton && (
                        <Button
                            type="button"
                            variant="outlined"
                            sx={{ textTransform: 'none' }}
                            disabled={isSubmitting}
                            onClick={() => {
                                onClose?.();
                                navigate('/dashboard/property/create');
                            }}
                        >
                            Thêm đầy đủ
                        </Button>
                    )}
                    <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} disabled={isSubmitting}>
                        {t('pages.property.form.save')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default PropertyAddModal;
