import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box
} from '@mui/material';

const liveUsers = [
    { range: '0-30', sessions: 2250, views: 4250 },
    { range: '31-60', sessions: 1501, views: 2050 },
    { range: '61-120', sessions: 750, views: 1600 },
    { range: '121-240', sessions: 540, views: 1040 },
];

export default function LiveUsersByCountry() {
    return (
        <Card sx={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            height: '100%'
        }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Live Users By Country
                </Typography>
            </Box>

            {/* Table */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>
                                RANGE
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>
                                SESSIONS
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>
                                VIEWS
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {liveUsers.map((user, idx) => (
                            <TableRow
                                key={idx}
                                sx={{
                                    '&:last-child td': { borderBottom: 0 },
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    transition: 'background-color .2s ease'
                                }}
                            >
                                <TableCell sx={{ py: 2.5, fontSize: '0.9rem' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {user.range}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {user.sessions.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                        {user.views.toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
