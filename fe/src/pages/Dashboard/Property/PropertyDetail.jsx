import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from '@components/MainCard';
import MetaData from '@components/MetaData';
import { useGlobalContext } from '@providers/GlobalProvider';
import { getById, update } from './PropertyServices';
import PropertyAddModal from './PropertyAddModal';

const labels = { pending: 'Chờ duyệt', published: 'Đã duyệt', archived: 'Từ chối/Lưu trữ', draft: 'Bản nháp', sold: 'Đã bán', rented: 'Đã thuê' };
const colors = { pending: 'warning', published: 'success', archived: 'error', sold: 'info', rented: 'info' };
const money = (value) => value == null ? '—' : `${Number(value).toLocaleString('vi-VN')} đ`;

export default function PropertyDetail() {
    const { id } = useParams(); const navigate = useNavigate(); const ui = useGlobalContext(); const uiRef = useRef(ui); uiRef.current = ui;
    const [item, setItem] = useState(null);
    const [isEditing,setIsEditing]=useState(false);
    const loadData = useCallback(async () => { uiRef.current.showLoading(); try { const response = await getById(id); setItem(response.data?.data ?? null); } catch (error) { uiRef.current.showNotification(error.response?.data?.message || 'Không thể tải chi tiết tin', 'error'); navigate('/dashboard/property'); } finally { uiRef.current.hideLoading(); } }, [id, navigate]);
    useEffect(() => { void loadData(); }, [loadData]);
    async function review(approved) { uiRef.current.showLoading(); try { await update(id, { status: approved ? 'published' : 'archived', is_active: approved }); uiRef.current.showNotification(approved ? 'Đã duyệt và xuất bản tin' : 'Đã từ chối tin', 'success'); await loadData(); } catch (error) { uiRef.current.showNotification(error.response?.data?.message || 'Không thể cập nhật trạng thái tin', 'error'); } finally { uiRef.current.hideLoading(); } }
    async function save(formData){uiRef.current.showLoading();try{await update(id,formData);uiRef.current.showNotification('Đã cập nhật toàn bộ thông tin bất động sản','success');setIsEditing(false);await loadData()}catch(error){uiRef.current.showNotification(error.response?.data?.message||error.response?.data?.error||'Không thể cập nhật tin','error')}finally{uiRef.current.hideLoading()}}
    if (!item) return null;
    const location = [item.address_detail, item.address, item.ward, item.district, item.city].filter(Boolean).join(', ');
    const images = [item.featured_image, ...(item.images || []).map((image) => image.url)].filter(Boolean);
    return <MainCard pageTitle={`Chi tiết tin #${item.id}`} pageDescription="Kiểm tra đầy đủ nội dung trước khi xét duyệt" breadcrumbs={[{ label: 'Quản lý tin', path: '/dashboard/property' }, { label: `Tin #${item.id}`, path: `/dashboard/property/${item.id}` }]}>
        <MetaData title={`Duyệt tin - ${item.title}`} description="Chi tiết tin bất động sản" />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}><Button onClick={() => navigate('/dashboard/property')}>← Quay lại danh sách</Button><Stack direction="row" spacing={1} alignItems="center"><Chip label={labels[item.status] || item.status} color={colors[item.status] || 'default'} /><Button variant={isEditing?'outlined':'contained'} onClick={()=>setIsEditing((value)=>!value)}>{isEditing?'Hủy sửa':'Sửa tin'}</Button>{!isEditing&&item.status === 'pending' ? <><Button variant="contained" color="success" onClick={() => void review(true)}>Duyệt tin</Button><Button variant="outlined" color="error" onClick={() => void review(false)}>Từ chối</Button></> : null}</Stack></Stack>
        {isEditing?<Card variant="outlined"><CardContent><PropertyAddModal initialData={item} onSubmit={save} onClose={()=>setIsEditing(false)} showFullCreateButton={false}/></CardContent></Card>:<>
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}><Stack spacing={3}>
                <Card variant="outlined"><CardContent><Typography variant="h5" gutterBottom>{item.title}</Typography><Typography color="text.secondary">{item.property_type?.name || 'Chưa xác định'} · {item.listing_type === 'rent' ? 'Cho thuê' : 'Bán'}</Typography><Divider sx={{ my: 2 }} /><Box sx={{ '& img': { maxWidth: '100%' }, '& ul, & ol': { pl: 3 } }} dangerouslySetInnerHTML={{ __html: item.description || '<p>Không có mô tả.</p>' }} /></CardContent></Card>
                <Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Hình ảnh bất động sản ({images.length})</Typography>{images.length ? <Grid container spacing={2}>{images.map((url, index) => <Grid item xs={12} sm={6} key={`${url}-${index}`}><Box component="a" href={url} target="_blank" rel="noreferrer"><Box component="img" src={url} alt={`Ảnh bất động sản ${index + 1}`} sx={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 2 }} /></Box></Grid>)}</Grid> : <Typography color="text.secondary">Không có hình ảnh.</Typography>}</CardContent></Card>
            </Stack></Grid>
            <Grid item xs={12} md={4}><Stack spacing={3}>
                <Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Thông tin chính</Typography><Stack spacing={1}><Typography><b>Giá:</b> {money(item.price)} / {item.price_unit}</Typography><Typography><b>Diện tích:</b> {item.area ? `${item.area} m²` : '—'}</Typography><Typography><b>Phòng ngủ:</b> {item.bedrooms ?? '—'}</Typography><Typography><b>Phòng tắm:</b> {item.bathrooms ?? '—'}</Typography><Typography><b>Tầng:</b> {item.floor ?? '—'}</Typography><Typography><b>Pháp lý:</b> {item.legal_info || '—'}</Typography><Typography><b>Địa chỉ:</b> {location || '—'}</Typography><Typography><b>Phí đăng:</b> {money(item.posting_fee)}</Typography><Typography><b>Ngày gửi:</b> {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '—'}</Typography></Stack></CardContent></Card>
                <Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Người đăng</Typography><Stack spacing={1}><Typography><b>Họ tên:</b> {item.user?.name || '—'}</Typography><Typography><b>Email:</b> {item.user?.email || '—'}</Typography><Typography><b>Điện thoại:</b> {item.user?.detail?.phone || '—'}</Typography><Typography><b>Loại tài khoản:</b> {item.user?.account_type === 'property_owner' ? 'Chủ bất động sản' : item.user?.account_type || '—'}</Typography></Stack></CardContent></Card>
                <Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Tiện ích</Typography><Stack direction="row" gap={1} flexWrap="wrap">{item.amenities?.length ? item.amenities.map((amenity) => <Chip key={amenity.id} label={amenity.name} variant="outlined" />) : <Typography color="text.secondary">Không có tiện ích.</Typography>}</Stack></CardContent></Card>
            </Stack></Grid>
        </Grid></>}
    </MainCard>;
}
