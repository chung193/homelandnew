import { useState, useEffect } from 'react';
import { Container, Grid, Stack, Box, Card, Alert, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { People, Assignment, MessageOutlined, DescriptionOutlined, FolderOutlined, LabelOutlined } from '@mui/icons-material';
import StatCard from './components/StatCard';
import { getStatisticsDashboard, getMonthlyTrends } from '@services/statistics';
import { useGlobalContext } from '@providers/GlobalProvider';
import PostsByCategoryChart from './components/PostsByCategoryChart';
import UsersByRoleChart from './components/UsersByRoleChart';
import TrendsChart from './components/TrendsChart';

const iconMap = {
    'Users': People,
    'FileText': Assignment,
    'MessageSquare': MessageOutlined,
    'FileCode': DescriptionOutlined,
};

export default function Home() {
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState(null);
    const { showLoading, hideLoading } = useGlobalContext();

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            showLoading();
            const dashboardData = await getStatisticsDashboard();
            const trendsData = await getMonthlyTrends();
            setStats(dashboardData);
            setTrends(trendsData);
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            hideLoading();
        }
    };

    const statData = stats?.summary?.map(stat => ({
        ...stat,
        icon: iconMap[stat.icon],
        trendLabel: 'vs. previous month'
    })) || [];

    return (
        <Box sx={{ bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="xl">
                {/* Info Alert */}
                <Alert
                    severity="info"
                    icon={false}
                    sx={{
                        mb: 3,
                        backgroundColor: 'primary.lighter',
                        color: 'primary.main',
                        border: '1px solid',
                        borderColor: 'primary.light',
                        borderRadius: 1.5,
                        '& .MuiAlert-message': { width: '100%' }
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Welcome to Dashboard
                            </Typography>
                            <Typography variant="caption">
                                Real-time statistics of your content management system
                            </Typography>
                        </Box>
                    </Stack>
                </Alert>

                {/* Stat Cards - 4 Column */}
                <Grid container spacing={2} mb={3}>
                    {statData.map((stat, idx) => (
                        <Grid item xs={12} sm={6} lg={3} key={idx}>
                            <StatCard {...stat} />
                        </Grid>
                    ))}
                </Grid>

                {/* Monthly Trends Chart */}
                {trends && (
                    <Box mb={3}>
                        <TrendsChart data={trends} />
                    </Box>
                )}

                {/* Charts Row */}
                <Grid container spacing={2} mb={3}>
                    {stats?.charts?.postsByCategory?.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <PostsByCategoryChart data={stats.charts.postsByCategory} />
                        </Grid>
                    )}
                    {stats?.charts?.usersByRole?.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <UsersByRoleChart data={stats.charts.usersByRole} />
                        </Grid>
                    )}
                </Grid>

                {/* Details Grid */}
                <Grid container spacing={2} mb={3}>
                    {/* Users Details */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card sx={{ p: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                            <Stack spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Users</Typography>
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Active:</Typography>
                                        <Chip label={stats?.details?.users?.active} size="small" color="success" variant="outlined" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Inactive:</Typography>
                                        <Chip label={stats?.details?.users?.inactive} size="small" color="error" variant="outlined" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">This Month:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats?.details?.users?.thisMonth}</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Posts Details */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card sx={{ p: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                            <Stack spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Posts</Typography>
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Published:</Typography>
                                        <Chip label={stats?.details?.posts?.published} size="small" color="success" variant="outlined" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Draft:</Typography>
                                        <Chip label={stats?.details?.posts?.draft} size="small" color="warning" variant="outlined" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">This Month:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats?.details?.posts?.thisMonth}</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Comments Details */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card sx={{ p: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                            <Stack spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Comments</Typography>
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Approved:</Typography>
                                        <Chip label={stats?.details?.comments?.approved} size="small" color="success" variant="outlined" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Pending:</Typography>
                                        <Chip label={stats?.details?.comments?.pending} size="small" color="warning" variant="outlined" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">This Month:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats?.details?.comments?.thisMonth}</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Others Details */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card sx={{ p: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                            <Stack spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Content</Typography>
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Categories:</Typography>
                                        <Chip label={stats?.details?.categories} size="small" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Pages:</Typography>
                                        <Chip label={stats?.details?.pages} size="small" />
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Tags:</Typography>
                                        <Chip label={stats?.details?.tags} size="small" />
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {/* Recent Activity Section */}
                {stats?.recentActivity && (
                    <>
                        {/* Recent Users */}
                        {stats.recentActivity.users?.length > 0 && (
                            <Box mb={3}>
                                <Card sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Users</Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Joined</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stats.recentActivity.users.map((user) => (
                                                    <TableRow key={user.id} hover>
                                                        <TableCell>{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={user.is_active ? 'Active' : 'Inactive'}
                                                                color={user.is_active ? 'success' : 'error'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Card>
                            </Box>
                        )}

                        {/* Recent Posts */}
                        {stats.recentActivity.posts?.length > 0 && (
                            <Box mb={3}>
                                <Card sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Posts</Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Category</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stats.recentActivity.posts.map((post) => (
                                                    <TableRow key={post.id} hover>
                                                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.name}</TableCell>
                                                        <TableCell>{post.category?.name || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={post.status}
                                                                color={post.status === 'published' ? 'success' : 'warning'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Card>
                            </Box>
                        )}

                        {/* Recent Comments */}
                        {stats.recentActivity.comments?.length > 0 && (
                            <Box>
                                <Card sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' }}>
                                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Comments</Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                    <TableCell>Content</TableCell>
                                                    <TableCell>Post</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stats.recentActivity.comments.map((comment) => (
                                                    <TableRow key={comment.id} hover>
                                                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{comment.body}</TableCell>
                                                        <TableCell>{comment.commentable?.name || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={comment.is_approved ? 'Approved' : 'Pending'}
                                                                color={comment.is_approved ? 'success' : 'warning'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Card>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}
