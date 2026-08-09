import { Card, CardHeader, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const recentVisitors = [
    {
        id: 1,
        name: 'Jeanette Williamson',
        time: '2 minutes ago',
        avatar: 'JW',
        color: '#3498db'
    },
    {
        id: 2,
        name: 'Mindy Brewer',
        time: '8 minutes ago',
        avatar: 'MB',
        color: '#2ecc71'
    },
    {
        id: 3,
        name: 'Marvin McKinney',
        time: '24 minutes ago',
        avatar: 'MM',
        color: '#e74c3c'
    },
    {
        id: 4,
        name: 'Bernard Williamson',
        time: '1 hour ago',
        avatar: 'BW',
        color: '#f39c12'
    },
];

export default function RecentVisitors() {
    const theme = useTheme();

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
            <CardHeader
                title="Recent Visitors"
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
                sx={{ pb: 1 }}
            />
            <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {recentVisitors.map((visitor) => (
                    <ListItem key={visitor.id} disablePadding>
                        <ListItemButton
                            sx={{
                                py: 1.5,
                                px: 1.5,
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(0, 0, 0, 0.03)',
                                },
                                mb: 0.5,
                                borderRadius: 1
                            }}
                        >
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: visitor.color,
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {visitor.avatar}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {visitor.name}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {visitor.time}
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Card>
    );
}
