import { useEffect, useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Stack, Tab, Tabs, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MainCard from '@components/MainCard';
import Toolbar from '@components/ToolBar';
import MetaData from '@components/MetaData';
import { useGlobalContext } from '@providers/GlobalProvider';
import { loadListViewOptions, saveListViewOptions } from '@utils/listViewOptions';
import LocationAddModal from './LocationAddModal';
import {
    bulkDestroyDistricts,
    bulkDestroyProvinces,
    bulkDestroyWards,
    createDistrict,
    createProvince,
    createWard,
    getDistrictList,
    getProvinceList,
    getPublicDistricts,
    getPublicProvinces,
    getWardList,
    updateDistrict,
    updateProvince,
    updateWard,
} from './LocationServices';

const STORAGE_KEY = 'list-view-options:location';

const MODE_CONFIG = {
    province: {
        label: 'Tỉnh/Thành phố',
        list: getProvinceList,
        create: createProvince,
        update: updateProvince,
        bulkDestroy: bulkDestroyProvinces,
    },
    district: {
        label: 'Quận/Huyện',
        list: getDistrictList,
        create: createDistrict,
        update: updateDistrict,
        bulkDestroy: bulkDestroyDistricts,
    },
    ward: {
        label: 'Phường/Xã',
        list: getWardList,
        create: createWard,
        update: updateWard,
        bulkDestroy: bulkDestroyWards,
    },
};

const Location = () => {
    const { showLoading, hideLoading, showNotification, openModal, closeModal, showConfirm, closeConfirm } = useGlobalContext();
    const savedViewOptions = useMemo(
        () => loadListViewOptions(STORAGE_KEY, { columnVisibilityModel: {}, pageSize: 15, viewMode: 'grid' }),
        []
    );

    const [mode, setMode] = useState('province');
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: savedViewOptions.pageSize });
    const [keyword, setKeyword] = useState('');

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [provinceFilterCode, setProvinceFilterCode] = useState('');
    const [districtFilterCode, setDistrictFilterCode] = useState('');

    useEffect(() => {
        getPublicProvinces()
            .then((res) => setProvinces(res.data.data || []))
            .catch(() => setProvinces([]));
    }, []);

    useEffect(() => {
        if (mode === 'ward' && provinceFilterCode) {
            getPublicDistricts(provinceFilterCode)
                .then((res) => setDistricts(res.data.data || []))
                .catch(() => setDistricts([]));
        } else if (mode === 'ward') {
            setDistricts([]);
            setDistrictFilterCode('');
        }
    }, [mode, provinceFilterCode]);

    useEffect(() => {
        loadData();
    }, [mode, paginationModel, keyword, provinceFilterCode, districtFilterCode]);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, { columnVisibilityModel, pageSize: paginationModel.pageSize, viewMode });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    const columns = useMemo(() => {
        const baseColumns = [
            {
                field: 'stt',
                headerName: 'STT',
                width: 70,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    const gridPagination = params.api.state.pagination?.paginationModel;
                    const page = gridPagination?.page ?? 0;
                    const pageSize = gridPagination?.pageSize ?? 0;
                    const indexInPage = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
                    return page * pageSize + indexInPage;
                },
            },
            {
                field: 'code',
                headerName: 'Mã',
                width: 110,
                editable: true,
                type: 'number',
            },
            {
                field: 'name',
                headerName: 'Tên',
                width: 230,
                editable: true,
            },
            {
                field: 'division_type',
                headerName: 'Loại',
                width: 140,
                editable: true,
            },
            {
                field: 'codename',
                headerName: 'Codename',
                width: 150,
                editable: true,
            },
            {
                field: 'is_active',
                headerName: 'Trạng thái',
                width: 130,
                editable: true,
                renderCell: (params) => <Chip label={params.value ? 'Hiển thị' : 'Ẩn'} color={params.value ? 'success' : 'default'} size="small" />,
            },
        ];

        if (mode === 'province') {
            return [
                ...baseColumns,
                { field: 'phone_code', headerName: 'Mã ĐT', width: 110, editable: true, type: 'number' },
                { field: 'order_level', headerName: 'Thứ tự', width: 100, editable: true, type: 'number' },
            ];
        }

        if (mode === 'district') {
            return [
                { field: 'province_code', headerName: 'Mã tỉnh', width: 120, editable: false },
                ...baseColumns,
            ];
        }

        return [
            { field: 'province_code', headerName: 'Mã tỉnh', width: 120, editable: false },
            { field: 'district_code', headerName: 'Mã quận', width: 120, editable: false },
            ...baseColumns,
        ];
    }, [mode]);

    const showOptionColumns = useMemo(
        () => columns.filter((column) => Boolean(column.field)).map((column) => ({
            field: column.field,
            label: typeof column.headerName === 'string' ? column.headerName : column.field,
        })),
        [columns]
    );

    const loadData = async () => {
        showLoading();
        try {
            const config = MODE_CONFIG[mode];
            const params = {
                page: paginationModel.page + 1,
                per_page: paginationModel.pageSize,
                keyword,
            };

            if (mode === 'district' && provinceFilterCode) {
                params.province_code = provinceFilterCode;
            }

            if (mode === 'ward' && provinceFilterCode) {
                params.province_code = provinceFilterCode;
            }

            if (mode === 'ward' && districtFilterCode) {
                params.district_code = districtFilterCode;
            }

            const res = await config.list(params);
            setRows(res.data.data || []);
            setRowCount(res.data.meta?.total || 0);
            setSelectedRows(new Set());
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi tải dữ liệu', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleSearch = (value) => {
        setKeyword(value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const processRowUpdate = (newRow, oldRow) => {
        setRows((prev) => prev.map((row) => (row.id === oldRow.id ? newRow : row)));

        const payload = {
            ...newRow,
            code: Number(newRow.code),
        };

        if (mode === 'province') {
            payload.phone_code = newRow.phone_code === null || newRow.phone_code === '' ? null : Number(newRow.phone_code);
            payload.order_level = newRow.order_level === null || newRow.order_level === '' ? 0 : Number(newRow.order_level);
        }

        MODE_CONFIG[mode]
            .update(newRow.id, payload)
            .then((res) => showNotification(res.data.message || 'Cập nhật thành công', 'success'))
            .catch((err) => showNotification(err.response?.data?.message || err.message, 'error'));

        return newRow;
    };

    const handleAdd = () => {
        openModal(`Thêm ${MODE_CONFIG[mode].label}`, <LocationAddModal mode={mode} onSubmit={addItem} onClose={closeModal} />);
    };

    const addItem = async (data) => {
        showLoading();
        try {
            await MODE_CONFIG[mode].create(data);
            showNotification(`Thêm ${MODE_CONFIG[mode].label.toLowerCase()} thành công`, 'success');
            closeModal();
            loadData();
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    const handleDelete = () => {
        showConfirm(
            `Xóa ${MODE_CONFIG[mode].label}`,
            `Bạn có chắc muốn xóa ${selectedRows.size} bản ghi?`,
            doDelete,
            closeModal
        );
    };

    const doDelete = async () => {
        showLoading();
        try {
            await MODE_CONFIG[mode].bulkDestroy(Array.from(selectedRows));
            showNotification('Xóa thành công', 'success');
            closeConfirm();
            loadData();
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    const handleModeChange = (_, newMode) => {
        setMode(newMode);
        setKeyword('');
        setProvinceFilterCode('');
        setDistrictFilterCode('');
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    return (
        <MainCard
            pageTitle="Quản lý Địa giới hành chính"
            pageDescription="Chỉnh sửa thông tin tỉnh/thành phố, quận/huyện, phường/xã"
            breadcrumbs={[
                { label: 'Home', path: '/dashboard' },
                { label: 'Địa giới hành chính', path: '/dashboard/location' },
            ]}
        >
            <MetaData title="Location Management" description="Location management page" />

            <Tabs value={mode} onChange={handleModeChange} sx={{ mb: 2 }}>
                <Tab value="province" label="Tỉnh/Thành phố" />
                <Tab value="district" label="Quận/Huyện" />
                <Tab value="ward" label="Phường/Xã" />
            </Tabs>

            {(mode === 'district' || mode === 'ward') && (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <TextField
                        select
                        label="Lọc theo tỉnh/thành"
                        size="small"
                        value={provinceFilterCode}
                        onChange={(event) => {
                            setProvinceFilterCode(event.target.value);
                            setDistrictFilterCode('');
                            setPaginationModel((prev) => ({ ...prev, page: 0 }));
                        }}
                        sx={{ minWidth: 260 }}
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        {provinces.map((item) => (
                            <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>
                        ))}
                    </TextField>

                    {mode === 'ward' && (
                        <TextField
                            select
                            label="Lọc theo quận/huyện"
                            size="small"
                            value={districtFilterCode}
                            onChange={(event) => {
                                setDistrictFilterCode(event.target.value);
                                setPaginationModel((prev) => ({ ...prev, page: 0 }));
                            }}
                            sx={{ minWidth: 260 }}
                            disabled={!provinceFilterCode}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            {districts.map((item) => (
                                <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                    )}
                </Stack>
            )}

            <Toolbar
                loadData={loadData}
                handleAdd={handleAdd}
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

            <Box sx={{ width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    disableRowSelectionOnClick
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
            </Box>
        </MainCard>
    );
};

export default Location;
