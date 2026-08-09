import { Outlet, NavLink } from 'react-router-dom';
import { Box } from '@mui/material';
import Menu from '@layouts/partials/Menu';
import SiteLogo from './partials/Menu/SiteLogo';
import { useSelector } from 'react-redux';
import AppBar from './partials/Header/AppBar';
import CreateBy from '@components/CreateBy';

const FULL = 250;
const MINI = 56;

export default function DashboardLayout() {
    const isCollapsed = useSelector((state) => state.ui.data.CollapseMenu);
    const sideWidth = isCollapsed ? MINI : FULL;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar cố định */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    width: `${sideWidth}px`,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    zIndex: 1005,
                    boxShadow: 'none',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    transition: 'width .3s ease',
                    display: { xs: 'none', sm: 'block' },
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '3px',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        },
                    },
                }}
            >
                <SiteLogo />
                <Menu open={!isCollapsed} />
            </Box>

            <AppBar />

            {/* Main full width + padding-left (đồng bộ với AppBar) */}
            <Box
                component="main"
                sx={{
                    pt: (t) => `${t.mixins.toolbar.minHeight || 64}px`,
                    pl: { xs: 0, sm: `${sideWidth}px` },
                    pr: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'padding-left .3s ease',
                    overflowX: 'hidden'
                }}
            >
                <Outlet />
                <CreateBy />
            </Box>
        </Box>
    );
}
