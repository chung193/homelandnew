import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { propertyTypeSchema } from './PropertyTypeSchema';
import { getAmenities } from './PropertyTypeServices';
import { slugify } from '@utils/common';

const PropertyTypeAddModal = ({ onSubmit, onClose }) => {
    const { t } = useTranslation('dashboard');
    const [amenities, setAmenities] = useState([]);

    useEffect(() => {
        const loadAmenities = async () => {
            try {
                const res = await getAmenities();
                setAmenities(res.data.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        loadAmenities();
    }, []);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(propertyTypeSchema),
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            is_active: true,
            sort_order: 0,
            amenity_ids: [],
        },
    });

    const submitHandler = (data) => {
        onSubmit({
            ...data,
            slug: data.slug || slugify(data.name),
            amenity_ids: (data.amenity_ids || []).map((item) => Number(item)),
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                <TextField label={t('pages.propertyType.form.name')} fullWidth size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
                <TextField label={t('pages.propertyType.form.slug')} fullWidth size="small" {...register('slug')} />
                <TextField label={t('pages.propertyType.form.description')} fullWidth multiline rows={3} size="small" {...register('description')} />
                <TextField label={t('pages.propertyType.form.sortOrder')} type="number" fullWidth size="small" {...register('sort_order', { valueAsNumber: true })} />

                <Controller
                    name="amenity_ids"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            SelectProps={{ multiple: true }}
                            fullWidth
                            size="small"
                            label={t('pages.propertyType.form.amenities')}
                            value={field.value || []}
                            onChange={(event) => field.onChange(event.target.value)}
                            helperText={t('pages.propertyType.form.amenitiesHelper')}
                        >
                            {amenities.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip label={item.icon || item.name} size="small" variant="outlined" />
                                        <span>{item.name}</span>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <FormControlLabel control={<Checkbox {...register('is_active')} defaultChecked />} label={t('pages.propertyType.form.isActive')} />
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button type="button" variant="outlined" sx={{ textTransform: 'none' }} disabled={isSubmitting} onClick={onClose}>
                        {t('pages.propertyType.form.close')}
                    </Button>
                    <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} disabled={isSubmitting}>
                        {t('pages.propertyType.form.save')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default PropertyTypeAddModal;
