import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { userSchema } from './UserSchema';

const UserAdd = ({ onSubmit, onClose }) => {
    const { t } = useTranslation('dashboard');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const submitHandler = (data) => {
        onSubmit(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                {/* NAME */}
                <TextField
                    label={t('pages.user.form.name')}
                    fullWidth
                    size="small"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                {/* EMAIL */}
                <TextField
                    label={t('pages.user.form.email')}
                    fullWidth
                    size="small"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />

                {/* PASSWORD */}
                <TextField
                    label={t('pages.user.form.password')}
                    type="password"
                    fullWidth
                    size="small"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />

                {/* PASSWORD CONFIRMATION */}
                <TextField
                    label={t('pages.user.form.passwordConfirmation')}
                    type="password"
                    fullWidth
                    size="small"
                    {...register('password_confirmation')}
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation?.message}
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
                        {t('pages.user.form.close')}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ textTransform: 'none' }}
                        disabled={isSubmitting}
                    >
                        {t('pages.user.form.save')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default UserAdd;
