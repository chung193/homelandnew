import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from '@components/MainCard';
import { useGlobalContext } from '@providers/GlobalProvider';
import { getOwnerApplication, getOwnerDocument, reviewOwnerApplication } from './OwnerApplicationServices';

const typeLabel = { company: 'Công ty', broker: 'Môi giới', household_business: 'Hộ kinh doanh / chủ hộ' };
const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

export default function OwnerApplicationDetail() {
    const { id } = useParams(); const navigate = useNavigate(); const ui = useGlobalContext(); const uiRef = useRef(ui); uiRef.current = ui;
    const [item, setItem] = useState(null); const [reason, setReason] = useState(''); const [preview, setPreview] = useState(null);
    const loadData = useCallback(async () => { uiRef.current.showLoading(); try { const response = await getOwnerApplication(id); setItem(response.data?.data ?? null); } catch (error) { uiRef.current.showNotification(error.response?.data?.error || 'Không thể tải hồ sơ', 'error'); navigate('/dashboard/owner-applications'); } finally { uiRef.current.hideLoading(); } }, [id, navigate]);
    useEffect(() => { void loadData(); }, [loadData]);
    useEffect(() => () => { if (preview?.url) URL.revokeObjectURL(preview.url); }, [preview]);

    async function openDocument(type) { try { const response = await getOwnerDocument(id, type); const url = URL.createObjectURL(response.data); const ownershipTitle = item.owner_type === 'company' ? 'Giấy đăng ký doanh nghiệp' : item.owner_type === 'broker' ? 'Chứng chỉ môi giới' : 'Giấy tờ hộ kinh doanh / sở hữu'; setPreview({ url, contentType: response.headers?.['content-type'] || response.data?.type || '', title: type === 'identity-front' ? 'CCCD mặt trước' : type === 'identity-back' ? 'CCCD mặt sau' : ownershipTitle }); } catch (error) { uiRef.current.showNotification(error.response?.data?.error || 'Không thể mở giấy tờ', 'error'); } }
    function closePreview() { if (preview?.url) URL.revokeObjectURL(preview.url); setPreview(null); }
    async function review(status) { if (status === 'rejected' && !reason.trim()) { uiRef.current.showNotification('Vui lòng nhập lý do từ chối', 'warning'); return; } uiRef.current.showLoading(); try { await reviewOwnerApplication(id, { status, rejection_reason: status === 'rejected' ? reason.trim() : null }); uiRef.current.showNotification(status === 'approved' ? 'Đã duyệt hồ sơ' : 'Đã từ chối hồ sơ', 'success'); await loadData(); } catch (error) { uiRef.current.showNotification(error.response?.data?.error || error.response?.data?.message || 'Không thể cập nhật', 'error'); } finally { uiRef.current.hideLoading(); } }

    if (!item) return null;
    return <MainCard title={`Chi tiết hồ sơ #${item.id} · ${typeLabel[item.owner_type] || item.owner_type}`}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}><Button onClick={() => navigate('/dashboard/owner-applications')}>← Quay lại danh sách</Button><Chip color={statusColor[item.status] || 'default'} label={statusLabel[item.status] || item.status} /></Stack>
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}><Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Người đăng ký</Typography><Stack spacing={1}><Info label="Họ tên" value={item.user?.name} /><Info label="Email" value={item.user?.email} /><Info label="Điện thoại" value={item.user?.detail?.phone} /><Info label="Ngày gửi" value={item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : null} /></Stack></CardContent></Card></Grid>
            <Grid item xs={12} md={6}><Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Loại tài khoản bổ sung</Typography><Stack spacing={1}><Info label="Loại hồ sơ" value={typeLabel[item.owner_type] || item.owner_type} />{item.owner_type === 'company' ? <><Info label="Tên công ty" value={item.company_name} /><Info label="Mã số thuế" value={item.tax_code} /><Info label="Địa chỉ trụ sở" value={item.company_address} /><Info label="Người đại diện pháp luật" value={item.legal_representative} /></> : null}<Info label="Ghi chú" value={item.note} /></Stack></CardContent></Card></Grid>
            <Grid item xs={12}><Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Giấy tờ xác minh</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={() => void openDocument('identity-front')}>CCCD mặt trước</Button><Button variant="outlined" onClick={() => void openDocument('identity-back')}>CCCD mặt sau</Button><Button variant="outlined" onClick={() => void openDocument('ownership')}>{item.owner_type === 'company' ? 'Giấy đăng ký doanh nghiệp' : item.owner_type === 'broker' ? 'Chứng chỉ môi giới' : 'Giấy tờ hộ kinh doanh'}</Button></Stack></CardContent></Card></Grid>
        </Grid>
        {item.rejection_reason ? <Typography color="error" sx={{ mt: 3 }}><b>Lý do từ chối:</b> {item.rejection_reason}</Typography> : null}
        {item.status === 'pending' ? <Stack spacing={2} sx={{ mt: 3 }}><TextField label="Lý do từ chối" multiline minRows={3} value={reason} onChange={(event) => setReason(event.target.value)} /><Stack direction="row" spacing={2}><Button variant="contained" color="success" onClick={() => void review('approved')}>Duyệt hồ sơ</Button><Button variant="outlined" color="error" onClick={() => void review('rejected')}>Từ chối</Button></Stack></Stack> : null}
        <Dialog open={Boolean(preview)} onClose={closePreview} fullWidth maxWidth="lg"><DialogTitle>{preview?.title}</DialogTitle><DialogContent dividers sx={{ minHeight: 600, bgcolor: 'grey.100' }}>{preview?.contentType?.startsWith('image/') ? <Box component="img" src={preview.url} alt={preview.title} sx={{ display: 'block', maxWidth: '100%', maxHeight: '75vh', mx: 'auto' }} /> : <Box component="iframe" src={preview?.url} title={preview?.title} sx={{ width: '100%', height: '75vh', border: 0, bgcolor: 'white' }} />}</DialogContent><DialogActions><Button onClick={closePreview}>Đóng</Button></DialogActions></Dialog>
    </MainCard>;
}

function Info({ label, value }) { return <Typography><b>{label}:</b> {value || 'Chưa cung cấp'}</Typography>; }
