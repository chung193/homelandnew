import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import MainCard from '@components/MainCard';
import { useGlobalContext } from '@providers/GlobalProvider';
import { getOwnerApplications } from './OwnerApplicationServices';

const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };
const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

export default function OwnerApplication() {
    const navigate = useNavigate();
    const ui = useGlobalContext();
    const uiRef = useRef(ui); uiRef.current = ui;
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [status, setStatus] = useState('');
    const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });

    const loadData = useCallback(async () => {
        uiRef.current.showLoading();
        try {
            const response = await getOwnerApplications({ page: paginationModel.page + 1, per_page: paginationModel.pageSize, ...(status ? { status } : {}) });
            const paginator = response.data?.data;
            setRows(paginator?.data ?? []);
            setRowCount(paginator?.total ?? 0);
            setCounts(response.data?.status_counts ?? { total: 0, pending: 0, approved: 0, rejected: 0 });
        } catch (error) { uiRef.current.showNotification(error.response?.data?.error || 'Không thể tải hồ sơ', 'error'); }
        finally { uiRef.current.hideLoading(); }
    }, [paginationModel, status]);

    useEffect(() => { void loadData(); }, [loadData]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Người đăng ký', minWidth: 190, flex: 1, valueGetter: (_value, row) => row.user?.name || '' },
        { field: 'email', headerName: 'Email', minWidth: 220, flex: 1, valueGetter: (_value, row) => row.user?.email || '' },
        { field: 'status', headerName: 'Trạng thái', width: 130, renderCell: ({ value }) => <Chip size="small" color={statusColor[value] || 'default'} label={statusLabel[value] || value} /> },
        { field: 'created_at', headerName: 'Ngày gửi', width: 180, valueFormatter: (value) => value ? new Date(value).toLocaleString('vi-VN') : '' },
    ];

    const statistics = [
        { key: 'total', label: 'Tổng hồ sơ', color: 'primary.main' },
        { key: 'pending', label: 'Đang chờ duyệt', color: 'warning.main' },
        { key: 'approved', label: 'Đã duyệt', color: 'success.main' },
        { key: 'rejected', label: 'Đã từ chối', color: 'error.main' },
    ];

    return <MainCard title="Duyệt hồ sơ chủ bất động sản">
        <Typography color="text.secondary" sx={{ mb: 2 }}>Chọn một hồ sơ trong bảng để xem giấy tờ và thực hiện xét duyệt.</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {statistics.map((stat) => <Grid item xs={6} md={3} key={stat.key}>
                <Card variant="outlined" sx={{ height: '100%', borderTop: 3, borderTopColor: stat.color }}>
                    <CardContent><Typography variant="body2" color="text.secondary">{stat.label}</Typography><Typography variant="h4" sx={{ mt: 0.5 }}>{counts[stat.key].toLocaleString('vi-VN')}</Typography></CardContent>
                </Card>
            </Grid>)}
        </Grid>
        <Box sx={{ mb: 2, width: 220 }}><FormControl fullWidth size="small"><InputLabel>Trạng thái</InputLabel><Select label="Trạng thái" value={status} onChange={(event) => { setStatus(event.target.value); setPaginationModel((current) => ({...current,page:0})); }}><MenuItem value="">Tất cả</MenuItem><MenuItem value="pending">Chờ duyệt</MenuItem><MenuItem value="approved">Đã duyệt</MenuItem><MenuItem value="rejected">Từ chối</MenuItem></Select></FormControl></Box>
        <DataGrid rows={rows} columns={columns} rowCount={rowCount} paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10,20,50]} disableRowSelectionOnClick onRowClick={({id}) => navigate(`/dashboard/owner-applications/${id}`)} sx={{ minHeight: 520, '& .MuiDataGrid-row': { cursor: 'pointer' } }} />
    </MainCard>;
}
