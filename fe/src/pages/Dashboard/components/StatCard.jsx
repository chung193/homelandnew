import { Card, Stack, Box, Typography, Chip } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

export default function StatCard({
    icon: Icon,
    title,
    value,
    trend,
    trendLabel,
    color = 'primary'
}) {
    const isPositive = trend >= 0;

    return (
        <Card sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderColor: `${color}.main`,
                transform: 'translateY(-2px)'
            }
        }}>
            {/* Header: Title + Icon */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {title}
                </Typography>
                {Icon && (
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: `${color}.lighter` || 'action.hover',
                        color: `${color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Icon sx={{ fontSize: 24 }} />
                    </Box>
                )}
            </Stack>

            {/* Value */}
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1.5, lineHeight: 1 }}>
                {value}
            </Typography>

            {/* Trend */}
            <Chip
                icon={isPositive ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
                label={`${Math.abs(trend)}% ${trendLabel || 'vs last month'}`}
                size="small"
                color={isPositive ? 'success' : 'error'}
                variant="outlined"
                sx={{ fontWeight: 500, width: 'fit-content', fontSize: '0.75rem' }}
            />
        </Card>
    );
}
