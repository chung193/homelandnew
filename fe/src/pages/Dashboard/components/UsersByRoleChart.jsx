import { Card, Box, Typography, Stack, LinearProgress } from '@mui/material';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function UsersByRoleChart({ data }) {
    if (!data || data.length === 0) {
        return null;
    }

    const maxCount = Math.max(...data.map(item => item.count));

    return (
        <Card sx={{ p: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Users by Role</Typography>
            </Box>
            <Stack spacing={2}>
                {data.map((item, index) => (
                    <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{item.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.count}</Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={(item.count / maxCount) * 100}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: COLORS[index % COLORS.length],
                                    borderRadius: 4,
                                }
                            }}
                        />
                    </Box>
                ))}
            </Stack>
        </Card>
    );
}
