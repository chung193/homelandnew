import { Button, Stack, TextField, Checkbox, FormControlLabel, Typography, Link, Box, CircularProgress } from '@mui/material';
import { useAuth } from '@providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import FormLayout from './layout/FormLayout';

/* ===== ZOD SCHEMA ===== */
const loginSchema = z.object({
    username: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    remember: z.boolean().optional(),
});

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: 'chungvd.it@gmail.com',
            password: '12345678',
            remember: false,
        },
    });

    const onSubmit = async (data) => {
        await login(data.username, data.password)
    };

    const headerChildren = (
        <Box sx={{ textAlign: 'right', mb: -2, mt: -1 }}>
            <Link
                href="/auth/forgot"
                sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' },
                }}
            >
                Forgot password?
            </Link>
        </Box>
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

                {/* Password Field */}
                <Box>
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        size="medium"
                        {...register('password')}
                        error={!!errors.password}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                    {errors.password && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.password?.message}
                        </Typography>
                    )}
                </Box>

                {/* Remember Me */}
                <FormControlLabel
                    control={
                        <Checkbox
                            {...register('remember')}
                            sx={{
                                '&.Mui-checked': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                    }
                    label="Remember me"
                    sx={{
                        mb: 0.5,
                        '& .MuiFormControlLabel-label': {
                            fontSize: 14,
                            color: 'text.secondary',
                        },
                    }}
                />

                {/* Sign In Button */}
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
                        'Sign In'
                    )}
                </Button>
            </Stack>
        </form>
    );

    const footerText = (
        <>
            Don't have an account?{' '}
            <Link
                href="/auth/register"
                sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                }}
            >
                Sign up
            </Link>
        </>
    );

    return (
        <FormLayout
            title="Welcome Back!"
            subtitle="Sign in to continue to your account"
            headerChildren={headerChildren}
            children={formContent}
            showDivider
            showSocialButtons
            footer={footerText}
        />
    );
}
