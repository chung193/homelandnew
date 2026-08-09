import {
    Card,
    Box,
    Typography,
    Stack,
    Select,
    MenuItem,
    FormControl,
    ButtonGroup,
    Button
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useState } from 'react';

const data = {
    sessions: [1010, 1640, 490, 1255, 1050, 689],
    users: [2000, 1500, 1000, 500, 1800, 900],
    countries: ['India', 'USA', 'China', 'Indonesia', 'Russia', 'Bangladesh']
};

export default function SessionsByCountry() {
    const [period, setPeriod] = useState('1m');

    return (
        <Card sx={{
            p: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
            height: '100%'
        }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sessions by Countries
                </Typography>
            </Stack>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={1} mb={2}>
                <ButtonGroup size="small" variant="outlined">
                    {['ALL', '1M', '6M'].map(period => (
                        <Button key={period} sx={{ fontWeight: 600 }}>
                            {period}
                        </Button>
                    ))}
                </ButtonGroup>
            </Stack>

            {/* Chart */}
            <Box sx={{ width: '100%', height: 280, '& svg': { overflow: 'visible' } }}>
                <BarChart
                    dataset={data.countries.map((country, idx) => ({
                        country,
                        sessions: data.sessions[idx],
                        users: data.users[idx]
                    }))}
                    xAxis={[{ scaleType: 'band', dataKey: 'country' }]}
                    series={[
                        { dataKey: 'sessions', label: 'Sessions', color: '#2c3e50' },
                        { dataKey: 'users', label: 'Users', color: '#8e44ad' }
                    ]}
                    slotProps={{
                        legend: {
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'left' },
                            margin: { top: 30 }
                        }
                    }}
                    margin={{ top: 10, bottom: 50, left: 40, right: 10 }}
                />
            </Box>
        </Card>
    );
}
