import { useMemo } from 'react';
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { amenitySchema } from './AmenitySchema';
import { slugify } from '@utils/common';

const COMMON_AMENITY_ICONS = [
    { label: 'Wi-Fi', value: 'Wifi', preview: 'Wi-Fi' },
    { label: 'Parking', value: 'Parking', preview: 'P' },
    { label: 'Pool', value: 'Pool', preview: 'Pool' },
    { label: 'Gym', value: 'Gym', preview: 'Gym' },
    { label: 'Air Conditioner', value: 'AirConditioner', preview: 'AC' },
    { label: 'TV', value: 'Tv', preview: 'TV' },
    { label: 'Kitchen', value: 'Kitchen', preview: 'Kit' },
    { label: 'Elevator', value: 'Elevator', preview: 'Lift' },
    { label: 'Security', value: 'Security', preview: 'Sec' },
    { label: 'Pet Friendly', value: 'PetFriendly', preview: 'Pets' },
    { label: 'Washing Machine', value: 'WashingMachine', preview: 'Wash' },
    { label: 'Balcony', value: 'Balcony', preview: 'Bal' },
    { label: 'Garden', value: 'Garden', preview: 'Garden' },
    { label: 'Fireplace', value: 'Fireplace', preview: 'Fire' },
    { label: 'Sauna', value: 'Sauna', preview: 'Sauna' },
    { label: 'Jacuzzi', value: 'Jacuzzi', preview: 'Jac' },
    { label: 'BBQ', value: 'Bbq', preview: 'BBQ' },
    { label: 'Playground', value: 'Playground', preview: 'Play' },
    { label: 'Laundry', value: 'Laundry', preview: 'Ldry' },
    { label: 'Terrace', value: 'Terrace', preview: 'Terr' },
    { label: 'Garage', value: 'Garage', preview: 'Gar' },
    { label: 'Desk', value: 'Desk', preview: 'Desk' },
    { label: 'Wardrobe', value: 'Wardrobe', preview: 'Ward' },
    { label: 'Refrigerator', value: 'Refrigerator', preview: 'Frig' },
    { label: 'Microwave', value: 'Microwave', preview: 'Mic' },
    { label: 'Coffee Machine', value: 'CoffeeMachine', preview: 'Coffee' },
    { label: 'Breakfast', value: 'Breakfast', preview: 'Brk' },
    { label: 'Shower', value: 'Shower', preview: 'Shwr' },
    { label: 'Bathtub', value: 'Bathtub', preview: 'Bath' },
    { label: 'Smart Lock', value: 'SmartLock', preview: 'Lock' },
    { label: 'CCTV', value: 'Cctv', preview: 'CCTV' },
    { label: 'Elevator Access', value: 'ElevatorAccess', preview: 'Lift' },
    { label: 'Solar Panel', value: 'SolarPanel', preview: 'Solar' },
    { label: 'Water Heater', value: 'WaterHeater', preview: 'Heat' },
    { label: 'Storage', value: 'Storage', preview: 'Stor' },
    { label: 'Home Office', value: 'HomeOffice', preview: 'Office' },
    { label: 'Billiard', value: 'Billiard', preview: 'Billiard' },
    { label: 'Private Cinema', value: 'PrivateCinema', preview: 'Cinema' },
    { label: 'Garden View', value: 'GardenView', preview: 'View' },
    { label: 'Sea View', value: 'SeaView', preview: 'Sea' },
    { label: 'City View', value: 'CityView', preview: 'City' },
    { label: 'Mountain View', value: 'MountainView', preview: 'Mt' },
];

const AmenityAddModal = ({ onSubmit, onClose }) => {
    const { t } = useTranslation('dashboard');
    const { control, register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(amenitySchema),
        defaultValues: {
            name: '',
            slug: '',
            icon: '',
            description: '',
            is_active: true,
            sort_order: 0,
        },
    });

    const iconValue = watch('icon', '');
    const preview = useMemo(() => {
        if (!iconValue) return null;
        const isImage = /^https?:\/\//i.test(iconValue) || iconValue.startsWith('data:image/');
        if (isImage) {
            return <img src={iconValue} alt="icon preview" style={{ width: 32, height: 32, objectFit: 'contain' }} />;
        }

        const matchedIcon = COMMON_AMENITY_ICONS.find((icon) => icon.value.toLowerCase() === iconValue.toLowerCase());
        if (matchedIcon) {
            return <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{matchedIcon.preview}</Typography>;
        }

        return <Typography variant="body2" color="text.secondary">{iconValue}</Typography>;
    }, [iconValue]);

    const submitHandler = (data) => {
        onSubmit({
            ...data,
            slug: data.slug || slugify(data.name),
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                <TextField label={t('pages.amenity.form.name')} fullWidth size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
                <TextField label={t('pages.amenity.form.slug')} fullWidth size="small" {...register('slug')} />
                <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            freeSolo
                            options={COMMON_AMENITY_ICONS}
                            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                            value={typeof field.value === 'string' ? COMMON_AMENITY_ICONS.find((item) => item.value.toLowerCase() === field.value.toLowerCase()) || field.value : field.value}
                            inputValue={typeof field.value === 'string' ? field.value : ''}
                            onChange={(_, newValue) => field.onChange(typeof newValue === 'string' ? newValue : newValue?.value || '')}
                            onInputChange={(_, newInputValue) => field.onChange(newInputValue)}
                            renderInput={(params) => <TextField {...params} label={t('pages.amenity.form.icon')} helperText={t('pages.amenity.form.iconHelper')} size="small" />}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography sx={{ color: 'text.primary', fontWeight: 600, minWidth: 44 }}>{option.preview}</Typography>
                                        <Typography sx={{ color: 'text.primary' }}>{option.label}</Typography>
                                    </Stack>
                                </Box>
                            )}
                        />
                    )}
                />
                {preview ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                        <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{preview}</Box>
                        <Typography variant="body2">{t('pages.amenity.form.preview')}</Typography>
                    </Box>
                ) : null}
                <TextField label={t('pages.amenity.form.description')} fullWidth multiline rows={3} size="small" {...register('description')} />
                <TextField label={t('pages.amenity.form.sortOrder')} type="number" fullWidth size="small" {...register('sort_order', { valueAsNumber: true })} />
                <FormControlLabel control={<Checkbox {...register('is_active')} defaultChecked />} label={t('pages.amenity.form.isActive')} />
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button type="button" variant="outlined" sx={{ textTransform: 'none' }} disabled={isSubmitting} onClick={onClose}>
                        {t('pages.amenity.form.close')}
                    </Button>
                    <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} disabled={isSubmitting}>
                        {t('pages.amenity.form.save')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default AmenityAddModal;
