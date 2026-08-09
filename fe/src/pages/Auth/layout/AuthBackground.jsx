import { Box } from '@mui/material';

const AuthBackground = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 25%, #8e44ad 75%, #3498db 100%)',
                overflow: 'hidden',

                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    top: '-150px',
                    left: '-150px',
                    filter: 'blur(80px)',
                    animation: 'float 20s ease-in-out infinite',
                },

                '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '50%',
                    bottom: '-100px',
                    right: '-100px',
                    filter: 'blur(60px)',
                    animation: 'float 25s ease-in-out infinite reverse',
                },

                '@keyframes float': {
                    '0%, 100%': {
                        transform: 'translate(0px, 0px)',
                    },
                    '50%': {
                        transform: 'translate(30px, 30px)',
                    },
                },
            }}
        >
            {/* Additional decorative circles */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(52, 152, 219, 0.1)',
                    borderRadius: '50%',
                    top: '50%',
                    right: '10%',
                    transform: 'translate(0, -50%)',
                    filter: 'blur(100px)',
                    animation: 'float 30s ease-in-out infinite',
                }}
            />
        </Box>
    );
};

export default AuthBackground;