import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import AuthBackground from '../pages/Auth/layout/AuthBackground';

export default function AuthLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <>
            <AuthBackground />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: { xs: 2, sm: 3, md: 4 },
                    gap: 3,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Main Card Container */}
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: '1200px',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: isMobile ? 'none' : theme.shadows[10],
                        backgroundColor: theme.palette.background.paper,
                        minHeight: { xs: 'auto', md: '600px' },
                        flex: 1,
                    }}
                >
                    {/* Left Side - Cover/Image Section */}
                    {!isMobile && (
                        <Box
                            sx={{
                                flex: 1,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                padding: 4,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    width: '400px',
                                    height: '400px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    top: '-100px',
                                    left: '-100px',
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    width: '300px',
                                    height: '300px',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    borderRadius: '50%',
                                    bottom: '-80px',
                                    right: '-80px',
                                },
                            }}
                        >
                            <Box sx={{ textAlign: 'center', zIndex: 1, maxWidth: 400 }}>
                                <Box
                                    sx={{
                                        fontSize: 60,
                                        fontWeight: 700,
                                        mb: 2,
                                        letterSpacing: '-2px',
                                    }}
                                >
                                    ✨
                                </Box>
                                <Box
                                    component="h1"
                                    sx={{
                                        fontSize: { xs: 28, sm: 36 },
                                        fontWeight: 700,
                                        mb: 2,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    Welcome to Start-Kit
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: 16,
                                        opacity: 0.9,
                                        lineHeight: 1.6,
                                        fontWeight: 400,
                                    }}
                                >
                                    Manage your content, permissions, and users with ease. Build amazing applications faster.
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Right Side - Form Section */}
                    <Box
                        sx={{
                            flex: isMobile ? 1 : 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: { xs: 2.5, sm: 3.5, md: 4.5 },
                            minHeight: { xs: 'auto', md: '600px' },
                        }}
                    >
                        <Box sx={{ width: '100%', maxWidth: '420px' }}>
                            <Outlet />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
