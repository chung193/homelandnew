import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { getPublicDistricts, getPublicProvinces } from './LocationServices';

const MODE_TITLE = {
    province: 'Tỉnh/Thành phố',
    district: 'Quận/Huyện',
    ward: 'Phường/Xã',
};

const LocationAddModal = ({ mode, onSubmit, onClose }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            province_code: '',
            district_code: '',
            code: '',
            name: '',
            name_en: '',
            full_name: '',
            full_name_en: '',
            division_type: '',
            codename: '',
            phone_code: '',
            order_level: 0,
            is_active: true,
        },
    });

    const selectedProvinceCode = watch('province_code');

    useEffect(() => {
        if (mode === 'district' || mode === 'ward') {
            getPublicProvinces()
                .then((res) => setProvinces(res.data.data || []))
                .catch(() => setProvinces([]));
        }
    }, [mode]);

    useEffect(() => {
        if (mode !== 'ward') {
            return;
        }

        if (!selectedProvinceCode) {
            setDistricts([]);
            setValue('district_code', '');
            return;
        }

        getPublicDistricts(selectedProvinceCode)
            .then((res) => setDistricts(res.data.data || []))
            .catch(() => setDistricts([]));
    }, [mode, selectedProvinceCode, setValue]);

    const title = useMemo(() => MODE_TITLE[mode] || 'Địa giới', [mode]);

    const submitHandler = (data) => {
        const payload = {
            ...data,
            code: Number(data.code),
            phone_code: data.phone_code === '' ? null : Number(data.phone_code),
            order_level: data.order_level === '' ? 0 : Number(data.order_level),
            province_code: data.province_code === '' ? undefined : Number(data.province_code),
            district_code: data.district_code === '' ? undefined : Number(data.district_code),
        };

        if (mode !== 'province') {
            delete payload.phone_code;
            delete payload.order_level;
        }

        if (mode === 'province') {
            delete payload.province_code;
            delete payload.district_code;
        }

        if (mode === 'district') {
            delete payload.district_code;
        }

        onSubmit(payload);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                <TextField label={`Mã ${title}`} type="number" fullWidth size="small" {...register('code', { required: true, valueAsNumber: true })} required />
                <TextField label={`Tên ${title}`} fullWidth size="small" {...register('name', { required: true })} required />

                {(mode === 'district' || mode === 'ward') && (
                    <TextField
                        select
                        label="Tỉnh/Thành phố"
                        fullWidth
                        size="small"
                        value={selectedProvinceCode || ''}
                        {...register('province_code', { required: true })}
                        required
                    >
                        {provinces.map((item) => (
                            <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>
                        ))}
                    </TextField>
                )}

                {mode === 'ward' && (
                    <TextField select label="Quận/Huyện" fullWidth size="small" {...register('district_code', { required: true })} required disabled={!selectedProvinceCode}>
                        {districts.map((item) => (
                            <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>
                        ))}
                    </TextField>
                )}

                {mode === 'province' && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField label="Mã điện thoại" type="number" fullWidth size="small" {...register('phone_code')} />
                        <TextField label="Thứ tự" type="number" fullWidth size="small" {...register('order_level')} />
                    </Stack>
                )}

                <TextField label="Tên tiếng Anh" fullWidth size="small" {...register('name_en')} />
                <TextField label="Tên đầy đủ" fullWidth size="small" {...register('full_name')} />
                <TextField label="Tên đầy đủ (EN)" fullWidth size="small" {...register('full_name_en')} />
                <TextField label="Loại đơn vị" fullWidth size="small" {...register('division_type')} />
                <TextField label="Codename" fullWidth size="small" {...register('codename')} />
                <FormControlLabel control={<Checkbox {...register('is_active')} defaultChecked />} label="Kích hoạt" />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button type="button" variant="outlined" sx={{ textTransform: 'none' }} disabled={isSubmitting} onClick={onClose}>
                        Đóng
                    </Button>
                    <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} disabled={isSubmitting}>
                        Lưu
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default LocationAddModal;
