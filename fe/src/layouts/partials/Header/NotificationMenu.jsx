import { Stack, IconButton, Badge, Menu, MenuItem, Typography, Avatar, Box, Link } from '@mui/material';
import { NotificationsNone, Assignment, Folder } from '@mui/icons-material';
import { useState } from 'react';
import { green } from '@mui/material/colors';

const now = new Date().toLocaleString('vi-VN');

const notifications = [
    {
        title: 'You order placed',
        content: 'You order placed',
        created_at: now,
        type: <NotificationsNone />
    },
    {
        title: 'James Lemire',
        content: 'You order placed',
        created_at: now,
        type: <Assignment />
    },
    {
        title: 'Your items is shipped',
        content: 'You order placed',
        created_at: now,
        type: <Folder />
    }
];

const NotificationMenu = () => {
    const [anchorElNav, setAnchorElNav] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    return (
        <>
            <IconButton onClick={handleOpenNavMenu} sx={{ p: 0, color: 'text.primary' }}>
                <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', minWidth: '20px' } }}>
                    <NotificationsNone />
                </Badge>
            </IconButton>

            <Menu
                sx={{
                    '& .MuiMenu-paper': {
                        mt: 1,
                        minWidth: '360px',
                        boxShadow: '0 5px 25px rgba(0, 0, 0, 0.1)',
                        borderRadius: 1.5
                    }
                }}
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Notifications</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Mark all as read</Typography>
                </Box>
                {notifications.map((notification) => (
                    <MenuItem key={notification.title} onClick={handleCloseNavMenu} sx={{ py: 1.5, px: 2, '&:hover': { backgroundColor: 'action.hover' } }}>
                        <Stack direction={'row'} spacing={2} sx={{ width: '100%' }}>
                            <Avatar sx={{ bgcolor: green[500], width: 40, height: 40, flexShrink: 0 }}>{notification.type}</Avatar>
                            <Stack sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{notification.title}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{notification.content}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{notification.created_at}</Typography>
                            </Stack>
                        </Stack>
                    </MenuItem>
                ))}
                <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Link href="#" sx={{ fontSize: '0.875rem', fontWeight: 500, '&:hover': { textDecoration: 'none' } }}>View all notifications</Link>
                </Box>
            </Menu>
        </>
    )
}

export default NotificationMenu