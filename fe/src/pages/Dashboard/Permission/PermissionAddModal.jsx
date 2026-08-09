import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { permissionSchema } from './PermissionSchema';

const PermissionAdd = ({ onSubmit, onClose }) => {
    const { t } = useTranslation('dashboard');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(permissionSchema),
        defaultValues: {
            name: '',
            guard_name: 'api',
            description: '',
        },
    });

    const submitHandler = (data) => {
        onSubmit(data);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(submitHandler)}
            noValidate
        >
            <Stack spacing={2}>
                <TextField
                    label={t('pages.permission.form.name')}
                    fullWidth
                    size="small"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                {/* GUARD NAME */}
                <TextField
                    label={t('pages.permission.form.guardName')}
                    fullWidth
                    size="small"
                    {...register('guard_name')}
                    error={!!errors.guard_name}
                    helperText={errors.guard_name?.message}
                />

                {/* DESCRIPTION */}
                <TextField
                    label={t('pages.permission.form.description')}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                />

                {/* ACTION */}
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button
                        type="button"
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        disabled={isSubmitting}
                        onClick={onClose}
                    >
                        {t('pages.permission.form.close')}
                    </Button>

                    <Button
                        type="submit"
                        sx={{ textTransform: 'none' }}
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {t('pages.permission.form.save')}
                    </Button>

                </Stack>
            </Stack>
        </Box>
    );
};

export default PermissionAdd;
