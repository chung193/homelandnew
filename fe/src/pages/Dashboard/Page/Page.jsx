import { useEffect, useMemo, useState } from 'react';
import MainCard from '@components/MainCard';
import CommentListPanel from '@components/CommentListPanel';
import { useGlobalContext } from '@providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { getAll, getById, storage, bulkDestroy, pageExport, update } from './PageServices';
import { DataGrid } from '@mui/x-data-grid';
import Toolbar from '@components/ToolBar';
import getColumns from './PageColumns.jsx';
import { getBreadcrumbs } from './PageBreadcrumb';
import PageAdd from './PageAddDrawer.jsx';
import { saveAs } from 'file-saver';
import MetaData from '@components/MetaData';
import { loadListViewOptions, saveListViewOptions } from '@utils/listViewOptions';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'list-view-options:page';

const Page = () => {
    const { showLoading, hideLoading, showNotification, openModal, closeModal, showConfirm, closeConfirm, openDrawer } = useGlobalContext();
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pageId = searchParams.get('id');
    const breadcrumbs = getBreadcrumbs(t);
    const savedViewOptions = useMemo(
        () =>
            loadListViewOptions(STORAGE_KEY, {
                columnVisibilityModel: {
                    slug: false,
                    description: false,
                    status: false,
                    user: false,
                },
                pageSize: 15,
                viewMode: 'grid',
            }),
        []
    );

    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: savedViewOptions.pageSize,
    });
    const [keyword, setKeyword] = useState('');
    const [editingPage, setEditingPage] = useState(null);

    const handleOpenComments = (row) => {
        openModal(
            `Bình luận của trang: ${row.name}`,
            <CommentListPanel commentableType="page" commentableId={row.id} />
        );
    };

    const columns = useMemo(() => getColumns(t, { onOpenComments: handleOpenComments }), [t]);
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

    useEffect(() => {
        if (pageId) return;
        loadData();
    }, [paginationModel, keyword, pageId]);

    useEffect(() => {
        if (!pageId) return;
        loadPageDetail(pageId);
    }, [pageId]);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, {
            columnVisibilityModel,
            pageSize: paginationModel.pageSize,
            viewMode,
        });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    const loadPageDetail = async (id) => {
        showLoading();
        try {
            const res = await getById(id);
            setEditingPage(res.data?.data || null);
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi tải trang', 'error');
            navigate('/dashboard/page');
        } finally {
            hideLoading();
        }
    };

    const loadData = async () => {
        showLoading();
        try {
            const res = await getAll({
                page: paginationModel.page + 1,
                per_page: paginationModel.pageSize,
                keyword,
            });

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

    const addPage = async (data) => {
        try {
            showLoading();
            const res = await storage(data);
            showNotification('Thêm trang thành công', 'success');
            loadData();
            closeModal();
            return res;
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
            throw err;
        } finally {
            hideLoading();
        }
    };

    const updatePageDetail = async (data, id) => {
        try {
            showLoading();
            const res = await update(id, data);
            showNotification('Cập nhật trang thành công', 'success');
            navigate('/dashboard/page');
            return res;
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
            throw err;
        } finally {
            hideLoading();
        }
    };

    const handleDelete = () => {
        showConfirm(
            t('pages.page.deleteConfirmTitle'),
            t('pages.page.deleteConfirmMessage', { count: selectedRows.size }),
            doDelete,
            closeModal
        );
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

    const handleExportExcel = async () => {
        try {
            showLoading('Đang xuất file...');
            const response = await pageExport({ keyword });
            const blob = new Blob([response.data], {
                type: response.headers['content-type'],
            });
            saveAs(blob, `page_${new Date().toISOString().split('T')[0]}.xlsx`);
            showNotification('Xuất file Excel thành công', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi khi export', 'error');
        } finally {
            hideLoading();
        }
    };

    if (pageId) {
        return (
            <MainCard
                pageTitle={`${t('pages.page.title')} - Edit`}
                pageDescription={t('pages.page.description')}
                breadcrumbs={breadcrumbs}
            >
                <MetaData title="Page Edit" description="Page edit page" />
                {editingPage && (
                    <PageAdd
                        mode="edit"
                        recordId={Number(pageId)}
                        initialData={editingPage}
                        onSubmit={updatePageDetail}
                        onBackToList={() => navigate('/dashboard/page')}
                        onClose={() => navigate('/dashboard/page')}
                    />
                )}
            </MainCard>
        );
    }

    return (
        <MainCard
            pageTitle={t('pages.page.title')}
            pageDescription={t('pages.page.description')}
            breadcrumbs={breadcrumbs}
        >
            <MetaData title="Page Management" description="Page management page" />
            <Toolbar
                loadData={loadData}
                handleAdd={() =>
                    openDrawer({
                        title: t('pages.page.addPage'),
                        content: <PageAdd onSubmit={addPage} onClose={closeModal} />,
                    })
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
                onRowSelectionModelChange={(newSelection) => {
                    setSelectedRows(new Set(newSelection.ids));
                }}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                pagination
                paginationMode="server"
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

export default Page;
