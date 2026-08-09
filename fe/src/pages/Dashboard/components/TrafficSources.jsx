import { Card, CardHeader, Box, Stack, Typography, Chip, useTheme } from '@mui/material';
import { FolderOpenOutlined } from '@mui/icons-material';

const trafficSources = [
    { name: 'Direct', value: 4286, percentage: 42.86, color: 'primary' },
    { name: 'Organic', value: 2156, percentage: 21.56, color: 'success' },
    { name: 'Social Media', value: 1654, percentage: 16.54, color: 'info' },
    { name: 'Email', value: 1025, percentage: 10.25, color: 'warning' },
    { name: 'Referral', value: 879, percentage: 8.79, color: 'error' },
];

export default function TrafficSources() {
    const theme = useTheme();

    return (
        <Card sx={{
            height: '100%',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
            <CardHeader
                title="Traffic Sources"
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
            />
            <Box sx={{ p: 3, pt: 0 }}>
                <Stack spacing={2}>
                    {trafficSources.map((source) => (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" key={source.name}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette[source.color].main,
                                    }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {source.name}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                                    {source.value.toLocaleString()}
                                </Typography>
                                <Chip
                                    label={`${source.percentage}%`}
                                    size="small"
                                    sx={{
                                        backgroundColor: theme.palette[source.color] + '.lighter',
                                        color: theme.palette[source.color].main,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        minWidth: 60
                                    }}
                                />
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            </Box>
        </Card>
    );
}
