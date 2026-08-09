import { IconButton, Box } from '@mui/material';
import { Menu } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { CollapseAction } from '@redux/UIReducer';
import Logo from '@components/Logo';

const SiteLogo = () => {
    const dispatch = useDispatch();
    const isCollapsed = useSelector((state) => state.ui.data.CollapseMenu);

    return (
        <Box
            sx={{
                p: isCollapsed ? '0.75rem 0' : '0.625rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '70px',
                transition: 'all .4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Logo />
            </Box>
            {!isCollapsed && (
                <IconButton
                    aria-label="Collapse sidebar"
                    onClick={() => dispatch(CollapseAction(!isCollapsed))}
                    size="small"
                    sx={{
                        color: 'inherit',
                        opacity: 0.7,
                        '&:hover': {
                            opacity: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        '&.Mui-focusVisible': {
                            outline: '2px solid rgba(255, 255, 255, 0.5)',
                            outlineOffset: 2,
                        },
                    }}
                >
                    <Menu fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
};

export default SiteLogo;
