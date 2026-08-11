import { useEffect, useMemo, useState } from 'react';
import MainCard from '@components/MainCard';
import { useGlobalContext } from '@providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { DataGrid } from '@mui/x-data-grid';
import Toolbar from '@components/ToolBar';
import MetaData from '@components/MetaData';
import { loadListViewOptions, saveListViewOptions } from '@utils/listViewOptions';
import { bulkDestroy, getAll, storage, update } from './PropertyServices';
import getColumns from './PropertyColumns';
import { getBreadcrumbs } from './PropertyBreadcrumb';
import PropertyAddModal from './PropertyAddModal';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { getPropertyTypes } from './PropertyServices';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'list-view-options:property';

const Property = () => {
    const { showLoading, hideLoading, showNotification, openModal, closeModal, showConfirm, closeConfirm } = useGlobalContext();
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const breadcrumbs = getBreadcrumbs(t);
    const [statusFilter, setStatusFilter] = useState('');
    const [listingTypeFilter, setListingTypeFilter] = useState('');
    const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
    const [propertyTypes, setPropertyTypes] = useState([]);
    const review = async (row, approved) => {
        showLoading();
        try {
            await update(row.id, { status: approved ? 'published' : 'archived', is_active: approved });
            setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: approved ? 'published' : 'archived', is_active: approved } : item));
            showNotification(approved ? 'Đã duyệt và xuất bản tin' : 'Đã từ chối tin', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Không thể cập nhật trạng thái tin', 'error');
        } finally { hideLoading(); }
    };
    const columns = useMemo(() => getColumns(t, (row) => review(row, true), (row) => review(row, false), (row) => navigate(`/dashboard/property/${row.id}`)), [t, navigate]);
    const showOptionColumns = useMemo(
        () => columns.filter((column) => Boolean(column.field)).map((column) => ({
            field: column.field,
            label: typeof column.headerName === 'string' ? column.headerName : column.field,
        })),
        [columns]
    );
    const savedViewOptions = useMemo(
        () => loadListViewOptions(STORAGE_KEY, { columnVisibilityModel: {}, pageSize: 15, viewMode: 'grid' }),
        []
    );
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: savedViewOptions.pageSize });
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        getPropertyTypes().then((res) => setPropertyTypes(res.data.data || [])).catch(() => setPropertyTypes([]));
    }, []);

    useEffect(() => {
        loadData();
    }, [paginationModel, keyword, statusFilter, listingTypeFilter, propertyTypeFilter]);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, { columnVisibilityModel, pageSize: paginationModel.pageSize, viewMode });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    const loadData = async () => {
        showLoading();
        try {
            const res = await getAll({ page: paginationModel.page + 1, per_page: paginationModel.pageSize, keyword, status: statusFilter, listingType: listingTypeFilter, propertyTypeId: propertyTypeFilter });
            setRows(res.data.data || []);
            setRowCount(res.data.meta?.total || 0);
            setSelectedRows(new Set());
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi tải dữ liệu', 'error');
        } finally {
            hideLoading();
        }
    };

    const processRowUpdate = (newRow, oldRow) => {
        setRows((prev) => prev.map((row) => (row.id === oldRow.id ? newRow : row)));
        update(newRow.id, newRow)
            .then((res) => showNotification(res.data.message || 'Cập nhật thành công', 'success'))
            .catch((err) => showNotification(err.response?.data?.message || err.message, 'error'));
        return newRow;
    };

    const handleSearch = (value) => {
        setKeyword(value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const addProperty = (data) => {
        showLoading();
        storage(data)
            .then(() => {
                showNotification('Thêm tài sản thành công', 'success');
                loadData();
                closeModal();
            })
            .catch((err) => showNotification(err.response?.data?.message || err.message, 'error'))
            .finally(hideLoading);
    };

    const handleDelete = () => {
        showConfirm(t('pages.property.deleteConfirmTitle'), t('pages.property.deleteConfirmMessage', { count: selectedRows.size }), doDelete, closeModal);
    };

    const doDelete = async () => {
        showLoading();
        try {
            await bulkDestroy(Array.from(selectedRows));
            showNotification('Xóa thành công', 'success');
            closeConfirm();
            loadData();
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    return (
        <MainCard pageTitle={t('pages.property.title')} pageDescription={t('pages.property.description')} breadcrumbs={breadcrumbs}>
            <MetaData title="Property Management" description="Property management page" />
            <Toolbar
                loadData={loadData}
                handleAdd={() => openModal(t('pages.property.addProperty'), <PropertyAddModal onSubmit={addProperty} onClose={closeModal} />)}
                deleteDisabled={selectedRows.size === 0}
                handleDelete={handleDelete}
                handleSearch={handleSearch}
                showOptionColumns={showOptionColumns}
                columnVisibilityModel={columnVisibilityModel}
                handleColumnVisibilityModelChange={setColumnVisibilityModel}
                pageSize={paginationModel.pageSize}
                handlePageSizeChange={(pageSize) => setPaginationModel((prev) => ({ ...prev, page: 0, pageSize }))}
                viewMode={viewMode}
                handleViewModeChange={setViewMode}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Trạng thái duyệt</InputLabel><Select value={statusFilter} label="Trạng thái duyệt" onChange={(event) => { setStatusFilter(event.target.value); setPaginationModel((prev) => ({ ...prev, page: 0 })); }}><MenuItem value="">Tất cả trạng thái</MenuItem><MenuItem value="pending">Chờ duyệt</MenuItem><MenuItem value="published">Đã duyệt</MenuItem><MenuItem value="archived">Đã từ chối/lưu trữ</MenuItem><MenuItem value="draft">Bản nháp</MenuItem><MenuItem value="sold">Đã bán</MenuItem><MenuItem value="rented">Đã thuê</MenuItem></Select></FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}><InputLabel>Hình thức</InputLabel><Select value={listingTypeFilter} label="Hình thức" onChange={(event) => { setListingTypeFilter(event.target.value); setPaginationModel((prev) => ({ ...prev, page: 0 })); }}><MenuItem value="">Tất cả</MenuItem><MenuItem value="sale">Bán</MenuItem><MenuItem value="rent">Cho thuê</MenuItem></Select></FormControl>
                <FormControl size="small" sx={{ minWidth: 220 }}><InputLabel>Loại bất động sản</InputLabel><Select value={propertyTypeFilter} label="Loại bất động sản" onChange={(event) => { setPropertyTypeFilter(event.target.value); setPaginationModel((prev) => ({ ...prev, page: 0 })); }}><MenuItem value="">Tất cả loại</MenuItem>{propertyTypes.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</Select></FormControl>
                <Button variant="text" onClick={() => { setStatusFilter(''); setListingTypeFilter(''); setPropertyTypeFilter(''); setKeyword(''); setPaginationModel((prev) => ({ ...prev, page: 0 })); }}>Xóa bộ lọc</Button>
            </Stack>

            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                checkboxSelection
                disableRowSelectionOnClick
                onRowDoubleClick={(params) => navigate(`/dashboard/property/${params.row.id}`)}
                onRowSelectionModelChange={(newSelection) => setSelectedRows(new Set(newSelection.ids))}
                pagination
                paginationMode="server"
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 15, 30, 50]}
                loading={false}
                processRowUpdate={processRowUpdate}
                getRowHeight={() => 'auto'}
                density={viewMode === 'list' ? 'comfortable' : 'standard'}
            />
        </MainCard>
    );
};

export default Property;
