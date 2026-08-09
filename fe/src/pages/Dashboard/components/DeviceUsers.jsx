import { Card, Stack, Box, Typography, Grid } from '@mui/material';
import { DesktopMacOutlined, PhoneAndroidOutlined, TabletMacOutlined } from '@mui/icons-material';

const DeviceUser = ({ icon: Icon, label, value, trend, color = 'primary' }) => (
    <Stack direction="column" alignItems="center" spacing={1}>
        <Box sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: `${color}.lighter` || 'action.hover',
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80
        }}>
            <Icon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {value}
        </Typography>
        <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </Typography>
    </Stack>
);

export default function DeviceUsers() {
    return (
        <Card sx={{
            p: 4,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider'
        }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
                Users by Device
            </Typography>

            <Grid container spacing={4} justifyContent="space-around">
                <Grid item xs={12} sm={6} md={4}>
                    <DeviceUser
                        icon={DesktopMacOutlined}
                        label="Desktop Users"
                        value="78.56k"
                        trend={2.08}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DeviceUser
                        icon={PhoneAndroidOutlined}
                        label="Mobile Users"
                        value="105.02k"
                        trend={10.52}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DeviceUser
                        icon={TabletMacOutlined}
                        label="Tablet Users"
                        value="42.89k"
                        trend={7.36}
                        color="warning"
                    />
                </Grid>
            </Grid>
        </Card>
    );
}
