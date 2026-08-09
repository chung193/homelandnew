import * as React from 'react';
import Stack from '@mui/material/Stack';
import { Gauge } from '@mui/x-charts/Gauge';
import { Typography } from '@mui/material';

export default function SimpleGauge() {
    return (
        <>
            <Typography>Simple Gauge</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }}>
                <Gauge width={100} height={100} value={50} />
                <Gauge width={100} height={100} value={50} valueMin={10} valueMax={60} />
            </Stack>
        </>

    );
}
