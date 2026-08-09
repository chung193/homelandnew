import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography } from '@mui/material';

const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = [
    'Page A',
    'Page B',
    'Page C',
    'Page D',
    'Page E',
    'Page F',
    'Page G',
];

export default function StackedBarChart() {
    return (
        <>
            <Typography>Stacked barchart</Typography>
            <BarChart
                height={300}
                series={[
                    { data: pData, label: 'pv', id: 'pvId', stack: 'total' },
                    { data: uData, label: 'uv', id: 'uvId', stack: 'total' },
                ]}
                xAxis={[{ data: xLabels }]}
                yAxis={[{ width: 50 }]}
            />
        </>

    );
}
