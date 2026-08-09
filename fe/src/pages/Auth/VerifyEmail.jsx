import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircularProgress, Typography, Box, Button, Stack } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import { useAuth } from '@providers/AuthProvider';
import FormLayout from './layout/FormLayout';

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();
    const url = params.get("url");
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'

    useEffect(() => {
        if (!url) {
            setStatus('error');
            return;
        }

        verifyEmail(decodeURIComponent(url))
            .then(() => {
                setStatus('success');
            })
            .catch(() => {
                setStatus('error');
            });
    }, []);

    if (status === 'verifying') {
        const content = (
            <Stack spacing={3} sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={60} />
                </Box>
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: 'text.primary',
                        }}
                    >
                        Verifying Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please wait while we verify your email address...
                    </Typography>
                </Box>
            </Stack>
        );

        return <FormLayout children={content} />;
    }

    if (status === 'success') {
        const content = (
            <Stack spacing={3} sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
                </Box>
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: 'success.main',
                        }}
                    >
                        Email Verified!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Your email has been successfully verified. You can now log in to your account.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/auth/login')}
                    sx={{
                        py: 1.5,
                        fontSize: 15,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 1,
                    }}
                >
                    Go to Login
                </Button>
            </Stack>
        );

        return <FormLayout children={content} />;
    }

    const content = (
        <Stack spacing={3} sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Error sx={{ fontSize: 80, color: 'error.main' }} />
            </Box>
            <Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: 'error.main',
                    }}
                >
                    Verification Failed
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    The verification link is invalid or has expired. Please try again or request a new link.
                </Typography>
            </Box>
            <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth/login')}
                sx={{
                    py: 1.5,
                    fontSize: 15,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1,
                }}
            >
                Back to Login
            </Button>
        </Stack>
    );

    return <FormLayout children={content} />;
}