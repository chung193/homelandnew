import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MainCard from '@components/MainCard';
import Toolbar from '@components/ToolBar';
import MetaData from '@components/MetaData';
import { useGlobalContext } from '@providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { loadListViewOptions, saveListViewOptions } from '@utils/listViewOptions';
import { getBreadcrumbs } from './CommentBreadcrumb';
import getColumns from './CommentColumns';
import { approveComment, bulkDestroy, destroy, getAll, getCommentCount } from './CommentServices';

const STORAGE_KEY = 'list-view-options:comment';
const STATUS_FILTERS = ['all', 'pending', 'approved'];

const Comment = () => {
    const { showLoading, hideLoading, showNotification, showConfirm, closeConfirm } = useGlobalContext();
    const { t } = useTranslation('dashboard');
    const breadcrumbs = getBreadcrumbs(t);
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
    const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0 });
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('all');
    const [approvingId, setApprovingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [rowCount, setRowCount] = useState(0);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: savedViewOptions.pageSize,
    });

    const columns = useMemo(
        () => getColumns(t, { onApprove: handleApproveRow, onDelete: handleDeleteRow, approvingId, deletingId }),
        [t, approvingId, deletingId]
    );

    const showOptionColumns = useMemo(
        () =>
            columns
                .filter((column) => Boolean(column.field) && column.field !== 'actions')
                .map((column) => ({
                    field: column.field,
                    label: typeof column.headerName === 'string' ? column.headerName : column.field,
                })),
        [columns]
    );

    useEffect(() => {
        loadData();
    }, [paginationModel, keyword, status]);

    useEffect(() => {
        loadCounts();
    }, []);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, {
            columnVisibilityModel,
            pageSize: paginationModel.pageSize,
            viewMode,
        });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    async function loadData() {
        showLoading();
        try {
            const res = await getAll({
                page: paginationModel.page + 1,
                per_page: paginationModel.pageSize,
                keyword,
                status,
            });

            setRows(res.data.data || []);
            setRowCount(res.data.meta?.total || 0);
            setSelectedRows(new Set());
        } catch (err) {
            showNotification(err.response?.data?.message || err.response?.data?.error || 'Lỗi tải comment', 'error');
        } finally {
            hideLoading();
        }
    }

    async function loadCounts() {
        try {
            const res = await getCommentCount();
            setCounts(res.data.data || { total: 0, pending: 0, approved: 0 });
        } catch (err) {
            showNotification(err.response?.data?.message || err.response?.data?.error || 'Không tải được thống kê comment', 'error');
        }
    }

    function handleSearch(value) {
        setKeyword(value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }

    function handleChangeStatus(nextStatus) {
        setStatus(nextStatus);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }

    async function handleApproveRow(row) {
        setApprovingId(row.id);
        try {
            const res = await approveComment(row.id);
            showNotification(res.data.data?.message || 'Duyệt comment thành công', 'success');
            await Promise.all([loadData(), loadCounts()]);
        } catch (err) {
            showNotification(err.response?.data?.message || err.response?.data?.error || 'Không duyệt được comment', 'error');
        } finally {
            setApprovingId(null);
        }
    }

    function handleDeleteRow(row) {
        showConfirm(
            t('pages.comment.deleteConfirmTitle'),
            t('pages.comment.deleteSingleConfirmMessage'),
            () => doDeleteRow(row.id),
            closeConfirm
        );
    }

    async function doDeleteRow(id) {
        setDeletingId(id);
        showLoading();
        try {
            await destroy(id);
            showNotification('Xóa comment thành công', 'success');
            closeConfirm();
            await Promise.all([loadData(), loadCounts()]);
        } catch (err) {
            showNotification(err.response?.data?.message || err.response?.data?.error || 'Không xóa được comment', 'error');
        } finally {
            hideLoading();
            setDeletingId(null);
        }
    }

    function handleDeleteSelected() {
        showConfirm(
            t('pages.comment.deleteConfirmTitle'),
            t('pages.comment.deleteConfirmMessage', { count: selectedRows.size }),
            doDeleteSelected,
            closeConfirm
        );
    }

    async function doDeleteSelected() {
        showLoading();
        try {
            await bulkDestroy(Array.from(selectedRows));
            showNotification('Xóa comment thành công', 'success');
            closeConfirm();
            await Promise.all([loadData(), loadCounts()]);
        } catch (err) {
            showNotification(err.response?.data?.message || err.response?.data?.error || 'Không xóa được comment', 'error');
        } finally {
            hideLoading();
        }
    }

    return (
        <MainCard
            pageTitle={t('pages.comment.title')}
            pageDescription={t('pages.comment.description')}
            breadcrumbs={breadcrumbs}
        >
            <MetaData title="Comment Moderation" description="Comment moderation page" />

            <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />} flexWrap="wrap" useFlexGap>
                    {STATUS_FILTERS.map((item) => (
                        <Button
                            key={item}
                            size="small"
                            variant={status === item ? 'contained' : 'text'}
                            onClick={() => handleChangeStatus(item)}
                        >
                            {t(`pages.comment.status.${item}`)} ({counts[item] || 0})
                        </Button>
                    ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {t('pages.comment.helper')}
                </Typography>
            </Box>

            <Toolbar
                loadData={() => {
                    loadData();
                    loadCounts();
                }}
                handleSearch={handleSearch}
                handleDelete={handleDeleteSelected}
                deleteDisabled={selectedRows.size === 0}
                showAdd={false}
                showDownload={false}
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
                pagination
                paginationMode="server"
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 15, 30, 50]}
                loading={false}
                getRowHeight={() => 'auto'}
                density={viewMode === 'list' ? 'comfortable' : 'standard'}
            />
        </MainCard>
    );
};

export default Comment;

