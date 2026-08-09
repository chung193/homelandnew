import { Button, Stack } from '@mui/material';
import { Google, Facebook, GitHub } from '@mui/icons-material';

// Note: Install react-icons for Twitter icon: npm install react-icons
// import { SiTwitter } from 'react-icons/si';

export default function SocialButtons() {
    const buttonSx = {
        minWidth: 48,
        width: 48,
        height: 48,
        borderRadius: '8px',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        border: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
    };

    return (
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
                variant="contained"
                sx={{
                    ...buttonSx,
                    backgroundColor: '#3b5998',
                    '&:hover': {
                        backgroundColor: '#2d4373',
                    },
                }}
            >
                <Facebook sx={{ fontSize: 20 }} />
            </Button>
            <Button
                variant="contained"
                sx={{
                    ...buttonSx,
                    backgroundColor: '#ea4335',
                    '&:hover': {
                        backgroundColor: '#c5221f',
                    },
                }}
            >
                <Google sx={{ fontSize: 20 }} />
            </Button>
            <Button
                variant="contained"
                sx={{
                    ...buttonSx,
                    backgroundColor: '#161b22',
                    '&:hover': {
                        backgroundColor: '#0d1117',
                    },
                }}
            >
                <GitHub sx={{ fontSize: 20 }} />
            </Button>
            <Button
                variant="contained"
                sx={{
                    ...buttonSx,
                    backgroundColor: '#1da1f2',
                    '&:hover': {
                        backgroundColor: '#1a91da',
                    },
                }}
                title="Twitter/X"
            >
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>𝕏</span>
            </Button>
        </Stack>
    );
}
