import { Card, Box, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function TrendsChart({ data }) {
    if (!data || !data.labels || !data.datasets) {
        return null;
    }

    // Transform data from the API format to table format
    const chartData = data.labels.map((label, index) => ({
        month: label,
        users: data.datasets[0].data[index],
        posts: data.datasets[1].data[index],
        comments: data.datasets[2].data[index],
    }));

    return (
        <Card sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>12-Month Trends</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                <span style={{ color: '#3b82f6' }}>● </span>Users
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                <span style={{ color: '#22c55e' }}>● </span>Posts
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                <span style={{ color: '#fb923c' }}>● </span>Comments
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chartData.map((row, index) => (
                            <TableRow key={index} hover>
                                <TableCell>{row.month}</TableCell>
                                <TableCell align="right">{row.users}</TableCell>
                                <TableCell align="right">{row.posts}</TableCell>
                                <TableCell align="right">{row.comments}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
