import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MainCard from '@components/MainCard';
import { useGlobalContext } from '@providers/GlobalProvider';
import { getIdentityVerificationDocument, getIdentityVerifications, reviewIdentityVerification } from './IdentityVerificationServices';

const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

export default function IdentityVerification() {
    const ui = useGlobalContext(); const uiRef = useRef(ui); uiRef.current = ui;
    const [rows, setRows] = useState([]); const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 }); const [preview, setPreview] = useState(null);
    const loadData = useCallback(async () => { uiRef.current.showLoading(); try { const response = await getIdentityVerifications({ page: paginationModel.page + 1, per_page: paginationModel.pageSize }); const paginator = response.data?.data; setRows(paginator?.data ?? []); setRowCount(paginator?.total ?? 0); } catch (error) { uiRef.current.showNotification(error.response?.data?.error || 'Không thể tải hồ sơ xác minh', 'error'); } finally { uiRef.current.hideLoading(); } }, [paginationModel]);
    useEffect(() => { void loadData(); }, [loadData]);
    useEffect(() => () => { if (preview?.url) URL.revokeObjectURL(preview.url); }, [preview]);

    async function review(id, status) { let rejection_reason = null; if (status === 'rejected') { rejection_reason = window.prompt('Lý do từ chối:')?.trim(); if (!rejection_reason) return; } uiRef.current.showLoading(); try { await reviewIdentityVerification(id, { status, rejection_reason }); uiRef.current.showNotification(status === 'approved' ? 'Đã duyệt hồ sơ' : 'Đã từ chối hồ sơ', 'success'); await loadData(); } catch (error) { uiRef.current.showNotification(error.response?.data?.error || 'Không thể cập nhật hồ sơ', 'error'); } finally { uiRef.current.hideLoading(); } }
    async function openDocument(row, side) { try { const response = await getIdentityVerificationDocument(row.id, side); const url = URL.createObjectURL(response.data); setPreview({ url, title: side === 'front' ? 'CCCD mặt trước' : 'CCCD mặt sau', contentType: response.headers?.['content-type'] || response.data?.type || '' }); } catch (error) { uiRef.current.showNotification(error.response?.data?.error || 'Không thể mở giấy tờ', 'error'); } }
    function closePreview() { if (preview?.url) URL.revokeObjectURL(preview.url); setPreview(null); }

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Người dùng', minWidth: 180, flex: 1, valueGetter: (_value, row) => row.user?.name || '' },
        { field: 'email', headerName: 'Email', minWidth: 210, flex: 1, valueGetter: (_value, row) => row.user?.email || '' },
        { field: 'verification_type', headerName: 'Loại xác minh', width: 150, valueFormatter: () => 'Cá nhân (CCCD)' },
        { field: 'status', headerName: 'Trạng thái', width: 125, renderCell: ({ value }) => <Chip size="small" color={statusColor[value] || 'default'} label={statusLabel[value] || value} /> },
        { field: 'documents', headerName: 'Giấy tờ', width: 240, sortable: false, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => void openDocument(row, 'front')}>Mặt trước</Button><Button size="small" onClick={() => void openDocument(row, 'back')}>Mặt sau</Button></Stack> },
        { field: 'actions', headerName: 'Xét duyệt', width: 190, sortable: false, renderCell: ({ row }) => row.status === 'pending' ? <Stack direction="row" spacing={1}><Button size="small" color="success" onClick={() => void review(row.id, 'approved')}>Duyệt</Button><Button size="small" color="error" onClick={() => void review(row.id, 'rejected')}>Từ chối</Button></Stack> : null },
    ];

    return <MainCard title="Xác minh CCCD cá nhân">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
            <Typography color="text.secondary">Một người dùng giữ tài khoản cá nhân và có thể đăng ký thêm nhiều tư cách kinh doanh.</Typography>
            <Button href="/dashboard/owner-applications" variant="contained">Duyệt công ty / môi giới</Button>
        </Stack>
        <DataGrid rows={rows} columns={columns} rowCount={rowCount} paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick sx={{ minHeight: 560 }} />
        <Dialog open={Boolean(preview)} onClose={closePreview} fullWidth maxWidth="lg"><DialogTitle>{preview?.title}</DialogTitle><DialogContent dividers sx={{ minHeight: 600, bgcolor: 'grey.100' }}>{preview?.contentType?.startsWith('image/') ? <Box component="img" src={preview.url} alt={preview.title} sx={{ display: 'block', maxWidth: '100%', maxHeight: '75vh', mx: 'auto' }} /> : <Box component="iframe" src={preview?.url} title={preview?.title} sx={{ width: '100%', height: '75vh', border: 0, bgcolor: 'white' }} />}</DialogContent><DialogActions><Button onClick={closePreview}>Đóng</Button></DialogActions></Dialog>
    </MainCard>;
}
