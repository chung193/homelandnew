import { Card, CardHeader, Box, Stack, Typography, LinearProgress, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const goals = [
    { id: 1, name: 'Purchase Completion', completed: 645, target: 1000, color: 'success' },
    { id: 2, name: 'Newsletter Signup', completed: 1234, target: 2000, color: 'primary' },
    { id: 3, name: 'Form Submission', completed: 789, target: 1500, color: 'warning' },
];

export default function ConversionGoals() {
    const theme = useTheme();

    return (
        <Card sx={{
            height: '100%',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
            <CardHeader
                title="Conversion Goals"
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
            />
            <Box sx={{ p: 3, pt: 0 }}>
                <Stack spacing={3}>
                    {goals.map((goal) => {
                        const percentage = (goal.completed / goal.target) * 100;
                        return (
                            <Box key={goal.id}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {goal.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {goal.completed.toLocaleString()} / {goal.target.toLocaleString()}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(percentage, 100)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: theme.palette[goal.color].main,
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                    {percentage.toFixed(1)}% Complete
                                </Typography>
                            </Box>
                        );
                    })}
                </Stack>
            </Box>
        </Card>
    );
}
