import { Button, Stack, TextField, Link, Typography, Box, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@providers/AuthProvider';
import FormLayout from './layout/FormLayout';

/* ===== ZOD SCHEMA ===== */
const forgotSchema = z.object({
    username: z.string().email('Email không hợp lệ'),
});

export default function Forgot() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/auth/login';
    const { forgot } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            username: 'chungvd.it@gmail.com',
        },
    });

    const onSubmit = async (data) => {
        await forgot(data.username);
        navigate(from, { replace: true });
    };

    const headerChildren = (
        <Link
            href="/auth/login"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: 14,
                mt: 1,
                '&:hover': {
                    textDecoration: 'underline',
                },
            }}
        >
            <ArrowBack sx={{ fontSize: 18 }} />
            Back to Login
        </Link>
    );

    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
                {/* Email Field */}
                <Box>
                    <TextField
                        fullWidth
                        label="Email"
                        placeholder="Enter your email"
                        size="medium"
                        {...register('username')}
                        error={!!errors.username}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                    {errors.username && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.username?.message}
                        </Typography>
                    )}
                </Box>

                {/* Submit Button */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                        py: 1.5,
                        fontSize: 15,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 1,
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: theme => `0 4px 12px rgba(${theme.palette.mode === 'dark' ? '59, 130, 246' : '59, 130, 246'}, 0.3)`,
                        '&:hover': {
                            boxShadow: theme => `0 6px 16px rgba(${theme.palette.mode === 'dark' ? '59, 130, 246' : '59, 130, 246'}, 0.4)`,
                        },
                        '&:disabled': {
                            background: 'rgba(128, 128, 128, 0.5)',
                        },
                    }}
                >
                    {isSubmitting ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                        'Send Reset Link'
                    )}
                </Button>
            </Stack>
        </form>
    );

    return (
        <FormLayout
            title="Forgot Password?"
            subtitle="Enter your email address and we'll send you a link to reset your password."
            headerChildren={headerChildren}
            children={formContent}
        />
    );
}
