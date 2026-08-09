import {
    Button,
    Stack,
    TextField,
    Link,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from '@providers/AuthProvider';
import FormLayout from './layout/FormLayout';

/* ===== ZOD SCHEMA ===== */
const resetSchema = z
    .object({
        password: z.string().min(6, "Ít nhất 6 ký tự"),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Mật khẩu không khớp",
        path: ["password_confirmation"],
    });

export default function ResetPassword() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { resetPassword } = useAuth();
    const token = params.get("token");
    const email = params.get("email");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(resetSchema),
    });

    if (!token || !email) {
        return (
            <FormLayout
                title="Invalid Link"
                subtitle="This password reset link is invalid or has expired."
                headerChildren={
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
                }
            />
        );
    }

    const onSubmit = async (data) => {
        try {
            await resetPassword({
                email,
                token,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            alert("Đổi mật khẩu thành công!");
            navigate("/auth/login");
        } catch (err) {
            console.log(err);
            alert("Reset thất bại!");
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
                {/* New Password Field */}
                <Box>
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        placeholder="Enter your new password"
                        size="medium"
                        {...register("password")}
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

                {/* Confirm Password Field */}
                <Box>
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your new password"
                        size="medium"
                        {...register("password_confirmation")}
                        error={!!errors.password_confirmation}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                    {errors.password_confirmation && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.password_confirmation?.message}
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
                        'Reset Password'
                    )}
                </Button>
            </Stack>
        </form>
    );

    return (
        <FormLayout
            title="Reset Password"
            subtitle="Enter your new password to reset your account"
            children={formContent}
        />
    );
}