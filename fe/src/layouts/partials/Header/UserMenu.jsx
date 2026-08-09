import { Stack, IconButton, Avatar, Menu, MenuItem, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@providers/AuthProvider';
import { AccountCircleOutlined, SettingsOutlined, LockOutlined, ExitToAppOutlined } from '@mui/icons-material';

const UserMenu = () => {
    const { user, logout } = useAuth();
    const [anchorElUser, setAnchorElUser] = useState(null);
    const settings = [
        {
            label: 'Profile',
            path: '',
            icon: <AccountCircleOutlined />
        },
        {
            label: 'Setting',
            path: '',
            icon: <SettingsOutlined />
        },
        {
            label: 'Lock Screen',
            path: '',
            icon: <LockOutlined />
        },
        {
            label: 'Signout',
            path: '',
            icon: <ExitToAppOutlined />,
            action: logout
        }
    ];

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <>
            <Stack
                direction="row"
                spacing={1.5}
                onClick={handleOpenUserMenu}
                sx={{
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: { xs: 0.5, sm: 1 },
                    borderRadius: 1,
                    transition: 'all .2s ease',
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                <Avatar
                    alt={user?.name}
                    src="/static/images/avatar/2.jpg"
                    sx={{ width: 36, height: 36 }}
                />
                <Stack sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <Typography variant='body2' sx={{ fontWeight: 500, lineHeight: 1 }}>{user?.name}</Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>Developer</Typography>
                </Stack>
            </Stack>
            <Menu
                id="menu-appbar"
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                sx={{
                    '& .MuiMenu-paper': {
                        mt: 1,
                        minWidth: { xs: '100%', sm: '240px' },
                        maxWidth: { xs: '90vw', sm: 'none' },
                        boxShadow: '0 5px 25px rgba(0, 0, 0, 0.1)',
                        borderRadius: 1.5
                    }
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {settings.map((setting) => (
                    <MenuItem
                        key={setting.label}
                        onClick={() => {
                            handleCloseUserMenu();
                            setting.action?.();
                        }}
                        sx={{ py: 1, px: 2, '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                        <Box sx={{ marginRight: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            {setting.icon}
                        </Box>
                        <Typography variant="body2">{setting.label}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}

export default UserMenu
