import { useEffect, useState, useMemo } from 'react';
import { useGlobalContext } from '@providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { getAll, storage, bulkDestroy, userExport, update } from './UserServices.js';
import { DataGrid } from '@mui/x-data-grid';
import Toolbar from '@components/ToolBar';
import getColumns from './UserColumns.jsx';
import UserAdd from './UserAddModal.jsx';
import { saveAs } from 'file-saver';
import { useSearchParams } from "react-router-dom";
import { getBreadcrumbs } from './UserBreadcrumb.js';
import MainCard from '@components/MainCard';
import { loadListViewOptions, saveListViewOptions } from '@utils/listViewOptions';

const STORAGE_KEY = 'list-view-options:user';

const UserTable = () => {
    const { showLoading, hideLoading, showNotification, openModal, closeModal, showConfirm, closeConfirm } = useGlobalContext();
    const { t } = useTranslation('dashboard');
    const columns = useMemo(() => getColumns(t), [t]);
    const showOptionColumns = useMemo(
        () =>
            columns
                .filter((column) => Boolean(column.field))
                .map((column) => ({
                    field: column.field,
                    label: typeof column.headerName === 'string' ? column.headerName : column.field,
                })),
        [columns]
    );
    const savedViewOptions = useMemo(
        () =>
            loadListViewOptions(STORAGE_KEY, {
                columnVisibilityModel: {},
                pageSize: 15,
                viewMode: 'grid',
            }),
        []
    );
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,       // DataGrid bắt đầu từ 0
        pageSize: savedViewOptions.pageSize,
    });
    const breadcrumbs = getBreadcrumbs(t);

    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        loadData();
    }, [paginationModel, keyword]);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, {
            columnVisibilityModel,
            pageSize: paginationModel.pageSize,
            viewMode,
        });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    // ===== LOAD DATA (SERVER PAGINATION) =====
    const loadData = async () => {
        showLoading();

        try {
            const res = await getAll({
                page: paginationModel.page + 1,
                per_page: paginationModel.pageSize,
                keyword,
            });

            setRows(res.data.data);
            setRowCount(res.data.meta.total);
            setSelectedRows(new Set());
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi tải dữ liệu', 'error');
        } finally {
            hideLoading();
        }
    };

    // ===== INLINE EDIT =====
    const processRowUpdate = (newRow, oldRow) => {
        setRows((prev) =>
            prev.map((row) => (row.id === oldRow.id ? newRow : row))
        );

        update(newRow.id, newRow)
            .then((res) => showNotification(res.data.message || 'Cập nhật thành công', 'success'))
            .catch((err) => showNotification(err.response?.data?.message || err.message, 'error'));

        return newRow;
    };

    // ===== SEARCH =====
    const handleSearch = (value) => {
        setKeyword(value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    // ===== ADD =====
    const addUser = (data) => {
        showLoading();
        storage(data)
            .then(() => {
                showNotification('Thêm người dùng thành công', 'success');
                loadData();
                closeModal();
            })
            .catch((err) => showNotification(err.response?.data?.message, 'error'))
            .finally(hideLoading);
    };

    // ===== DELETE =====
    const handleDelete = () => {
        showConfirm(
            t('pages.user.deleteConfirmTitle'),
            t('pages.user.deleteConfirmMessage', { count: selectedRows.size }),
            doDelete,
            closeModal
        );
    };

    const doDelete = async () => {
        showLoading();
        try {
            const res = await bulkDestroy(Array.from(selectedRows));
            showNotification('Xoá thành công', 'success');
            closeConfirm();
            loadData();
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // ===== EXPORT =====
    const handleExportExcel = async () => {
        try {
            showLoading('Đang xuất file...');
            const response = await userExport({ keyword });

            const blob = new Blob([response.data], {
                type: response.headers['content-type'],
            });

            saveAs(blob, `user_${new Date().toISOString().split('T')[0]}.xlsx`);
            showNotification('Xuất file Excel thành công', 'success');
        } catch (err) {
            showNotification(err.response.data.message || 'Lỗi khi export', 'error');
        } finally {
            hideLoading();
        }
    };

    return (
        <MainCard
            pageTitle={t('pages.user.title')}
            pageDescription={t('pages.user.description')}
            breadcrumbs={breadcrumbs}
        >
            {!id && <>
                <Toolbar
                    loadData={loadData}
                    handleAdd={() =>
                        openModal(
                            t('pages.user.addUser'),
                            <UserAdd onSubmit={addUser} onClose={closeModal} />
                        )
                    }
                    deleteDisabled={selectedRows.size === 0}
                    handleDelete={handleDelete}
                    handleSearch={handleSearch}
                    handleDownload={handleExportExcel}
                    showOptionColumns={showOptionColumns}
                    columnVisibilityModel={columnVisibilityModel}
                    handleColumnVisibilityModelChange={setColumnVisibilityModel}
                    pageSize={paginationModel.pageSize}
                    handlePageSizeChange={(pageSize) =>
                        setPaginationModel((prev) => ({ ...prev, page: 0, pageSize }))
                    }
                    viewMode={viewMode}
                    handleViewModeChange={setViewMode}
                />

                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    disableRowSelectionOnClick

                    //rowSelectionModel={selectedRows}
                    onRowSelectionModelChange={(newSelection) => {
                        console.log('selection', newSelection.ids);
                        setSelectedRows(new Set(newSelection.ids))
                    }
                    }

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
                /></>
            }
        </MainCard>
    );
};

export default UserTable;
