import { Card, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const topReferrals = [
    { id: 1, source: 'google.com', visits: 2845, percentage: 28.5 },
    { id: 2, source: 'facebook.com', visits: 2145, percentage: 21.4 },
    { id: 3, source: 'linkedin.com', visits: 1654, percentage: 16.5 },
    { id: 4, source: 'twitter.com', visits: 987, percentage: 9.9 },
    { id: 5, source: 'reddit.com', visits: 654, percentage: 6.5 },
];

export default function TopReferrals() {
    const theme = useTheme();

    return (
        <Card sx={{
            height: '100%',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
            <CardHeader
                title="Top Referrals"
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
            />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Source</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Visits</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Share</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topReferrals.map((referral, idx) => (
                            <TableRow
                                key={referral.id}
                                sx={{
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(0, 0, 0, 0.02)',
                                    }
                                }}
                            >
                                <TableCell sx={{ py: 2 }}>
                                    <Typography variant="body2">{referral.source}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {referral.visits.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2 }}>
                                    <Chip
                                        label={`${referral.percentage}%`}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'primary.lighter',
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
