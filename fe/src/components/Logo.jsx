import { Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Logo = () => {
    const isCollapsed = useSelector((state) => state.ui.data.CollapseMenu);

    // Local logo files
    const logoFull = '/logo-light.png';
    const logoIcon = '/logo.png';

    return (
        <Box
            component={NavLink}
            to="/"
            aria-label="Go to dashboard"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                '&:focus-visible': (theme) => ({
                    borderRadius: 1,
                    outline: `2px solid ${theme.palette.common.white}`,
                    outlineOffset: 2,
                }),
            }}
        >
            <Box
                component="img"
                src={isCollapsed ? logoIcon : logoFull}
                alt="Logo"
                loading="eager"
                sx={{
                    height: isCollapsed ? 32 : 35,
                    width: 'auto',
                    maxWidth: isCollapsed ? 32 : 140,
                    objectFit: 'contain',
                    opacity: 1,
                    transition: 'all .4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            />
        </Box>
    );
};

export default Logo;
