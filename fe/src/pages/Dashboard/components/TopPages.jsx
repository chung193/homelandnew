import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Stack,
    Box,
    Chip
} from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';

const topPages = [
    { path: '/dashboard/analytics', views: 1250, percentage: 28.5 },
    { path: '/pages/profile', views: 980, percentage: 22.3 },
    { path: '/settings', views: 756, percentage: 17.2 },
    { path: '/components', views: 625, percentage: 14.2 },
    { path: '/documentation', views: 512, percentage: 11.6 },
    { path: '/feedback', views: 321, percentage: 7.3 },
];

export default function TopPages() {
    return (
        <Card sx={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Top Pages
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: 'action.hover',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.selected' }
                    }}>
                        <FileDownloadOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </Box>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>
                                PAGE
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>
                                VIEWS
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary', py: 2 }}>
                                PERCENTAGE
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topPages.map((page, idx) => (
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
                                        {page.path}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {page.views.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                    <Chip
                                        label={`${page.percentage}%`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 600, borderColor: 'divider' }}
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
