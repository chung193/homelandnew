import { useEffect, useMemo, useState } from 'react';
import { Box, Divider, Link, Stack, Typography } from '@mui/material';
import MainCard from '@components/MainCard';
import CommentListPanel from '@components/CommentListPanel';
import { useGlobalContext } from '@providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@providers/AuthProvider';
import {
    getAll,
    getById,
    storage,
    bulkDestroy,
    postExport,
    update,
    getAllCategory,
    getPostCount,
    importWordpressXml,
} from './PostServices';
import { DataGrid } from '@mui/x-data-grid';
import PostToolbar from '@components/PostToolbar';
import getColumns from './PostColumns.jsx';
import { getBreadcrumbs } from './PostBreadcrumb';
import PostAdd from './PostAddDrawer.jsx';
import { saveAs } from 'file-saver';
import MetaData from '@components/MetaData';
import { loadListViewOptions, saveListViewOptions } from '@utils/listViewOptions';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'list-view-options:post';

const Post = () => {
    const { showLoading, hideLoading, showNotification, openDrawer, openModal, closeModal, showConfirm, closeConfirm } = useGlobalContext();
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const postId = searchParams.get('id');
    const { user } = useAuth();
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

    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [rows, setRows] = useState([]);
    const [count, setCount] = useState({});
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [categories, setCategories] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: savedViewOptions.pageSize,
    });
    const [keyword, setKeyword] = useState('');
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);
    const [editingPost, setEditingPost] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleOpenComments = (row) => {
        openModal(
            `Bình luận của bài viết: ${row.name}`,
            <CommentListPanel commentableType="post" commentableId={row.id} />
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
        if (postId) return;
        loadData();
    }, [paginationModel, keyword, postId]);

    useEffect(() => {
        if (!postId) return;
        loadPostDetail(postId);
    }, [postId]);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, {
            columnVisibilityModel,
            pageSize: paginationModel.pageSize,
            viewMode,
        });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    const loadPostDetail = async (id) => {
        showLoading();
        try {
            const res = await getById(id);
            setEditingPost(res.data?.data || null);
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi tải bài viết', 'error');
            navigate('/dashboard/post');
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
            const resCategories = await getAllCategory({ per_page: 100 });
            const resCount = await getPostCount({ keyword });

            setCategories(resCategories.data.data || []);
            setCount(resCount.data.data || {});
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

    const addPost = async (data) => {
        try {
            showLoading();
            const res = await storage(data);
            showNotification('Thêm bài viết thành công', 'success');
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

    const updatePostDetail = async (data, id) => {
        try {
            showLoading();
            const res = await update(id, data);
            showNotification('Cập nhật bài viết thành công', 'success');
            navigate('/dashboard/post');
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
            t('pages.post.deleteConfirmTitle'),
            t('pages.post.deleteConfirmMessage', { count: selectedRows.size }),
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

    const handleImportXml = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (user?.id) {
            formData.append('user_id', user.id);
        }
        formData.append('default_status', 'draft');
        formData.append('default_type', 'article');
        formData.append('skip_existing', '1');
        formData.append('allow_comments', '1');
        formData.append('featured', '0');

        setIsImporting(true);
        showLoading('Đang nhập XML...');
        try {
            const response = await importWordpressXml(formData);
            const payload = response.data?.data || {};
            const message = payload?.message || 'Nhập XML thành công';
            const summary = payload?.summary;
            const details = [];

            if (typeof summary?.imported === 'number') {
                details.push(`${summary.imported} bài nhập thành công`);
            }
            if (typeof summary?.skipped === 'number') {
                details.push(`${summary.skipped} bài bỏ qua`);
            }

            const notificationMessage = details.length ? `${message} (${details.join(', ')})` : message;
            showNotification(notificationMessage, 'success');
            await loadData();
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Lỗi khi nhập XML';
            showNotification(errorMessage, 'error');
        } finally {
            hideLoading();
            setIsImporting(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            showLoading('Đang xuất file...');
            const response = await postExport({ keyword });
            const blob = new Blob([response.data], {
                type: response.headers['content-type'],
            });
            saveAs(blob, `post_${new Date().toISOString().split('T')[0]}.xlsx`);
            showNotification('Xuất file Excel thành công', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi khi export', 'error');
        } finally {
            hideLoading();
        }
    };

    if (postId) {
        return (
            <MainCard
                pageTitle={`${t('pages.post.title')} - Edit`}
                pageDescription={t('pages.post.description')}
                breadcrumbs={breadcrumbs}
            >
                <MetaData title="Post Edit" description="Post edit page" />
                {editingPost && (
                    <PostAdd
                        mode="edit"
                        recordId={Number(postId)}
                        initialData={editingPost}
                        onSubmit={updatePostDetail}
                        onBackToList={() => navigate('/dashboard/post')}
                        onClose={() => navigate('/dashboard/post')}
                    />
                )}
            </MainCard>
        );
    }

    return (
        <MainCard
            pageTitle={t('pages.post.title')}
            pageDescription={t('pages.post.description')}
            breadcrumbs={breadcrumbs}
        >
            <MetaData title="Post Management" description="Post management page" />

            <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                    <Typography variant="subtitle2" gutterBottom>
                        Tất cả ({count.total || 0})
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                        <Link href="#">Đã xuất bản ({count.published || 0})</Link>
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                        <Link href="#">Nháp ({count.draft || 0})</Link>
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                        <Link href="#">Đang đợi ({count.pending || 0})</Link>
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                        <Link href="#">Lưu trữ ({count.archived || 0})</Link>
                    </Typography>
                </Stack>
            </Box>

            <PostToolbar
                loadData={loadData}
                handleAdd={() =>
                    openDrawer({
                        title: t('pages.post.addPost'),
                        content: <PostAdd onSubmit={addPost} onClose={closeModal} />,
                    })
                }
                categories={categories || []}
                deleteDisabled={selectedRows.size === 0}
                handleDelete={handleDelete}
                handleSearch={handleSearch}
                handleDownload={handleExportExcel}
                handleImport={handleImportXml}
                showOptionColumns={showOptionColumns}
                columnVisibilityModel={columnVisibilityModel}
                handleColumnVisibilityModelChange={setColumnVisibilityModel}
                pageSize={paginationModel.pageSize}
                handlePageSizeChange={(pageSize) =>
                    setPaginationModel((prev) => ({ ...prev, page: 0, pageSize }))
                }
                viewMode={viewMode}
                handleViewModeChange={setViewMode}
                importDisabled={isImporting}
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

export default Post;
