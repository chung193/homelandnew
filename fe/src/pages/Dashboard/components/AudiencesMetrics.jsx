import { Card, Stack, Box, Typography, Grid } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const MetricItem = ({ label, value, trend, percentage = true }) => (
    <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {label}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                {trend}{percentage ? '%' : ''}
            </Typography>
        </Stack>
    </Box>
);

export default function AudiencesMetrics() {
    return (
        <Card sx={{
            p: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider'
        }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Audiences Metrics
            </Typography>

            <Grid container spacing={0}>
                <Grid item xs={12} sm={6} md={4} sx={{ borderRight: { md: '1px solid', xs: 'none' }, borderColor: 'divider' }}>
                    <MetricItem
                        label="Avg. Session"
                        value="471"
                        trend={49}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ borderRight: { md: '1px solid', xs: 'none' }, borderColor: 'divider' }}>
                    <MetricItem
                        label="Conversion Rate"
                        value="785"
                        trend={60}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                    <MetricItem
                        label="Avg. Session Duration"
                        value="3m 40sec"
                        trend={37}
                    />
                </Grid>
            </Grid>
        </Card>
    );
}
