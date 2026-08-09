import { useEffect, useState } from 'react';
import { Box, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { getAll as getAllComments } from '@pages/Dashboard/Comment/CommentServices';

const formatDate = (value) => {
    if (!value) return '_';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('vi-VN');
};

export default function CommentListPanel({ commentableType, commentableId }) {
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadComments() {
            setLoading(true);
            setError('');

            try {
                const res = await getAllComments({
                    per_page: 100,
                    commentable_type: commentableType,
                    commentable_id: commentableId,
                });

                if (!active) return;

                setComments(res.data?.data || []);
                setTotal(res.data?.meta?.total || 0);
            } catch (err) {
                if (!active) return;
                setError(err.response?.data?.message || 'Không tải được bình luận.');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadComments();

        return () => {
            active = false;
        };
    }, [commentableId, commentableType]);

    return (
        <Box sx={{ width: { xs: '90vw', sm: 720 }, maxWidth: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }} spacing={2}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" color="text.secondary">Đang tải bình luận...</Typography>
                </Stack>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : comments.length === 0 ? (
                <Typography color="text.secondary">Chưa có bình luận nào.</Typography>
            ) : (
                <Stack divider={<Divider flexItem />}>
                    <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>
                        Tổng số bình luận: {total}
                    </Typography>

                    {comments.map((comment) => (
                        <Stack key={comment.id} spacing={1.25} sx={{ py: 1.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Typography variant="subtitle2">{comment.author_name || 'Ẩn danh'}</Typography>
                                <Chip
                                    size="small"
                                    label={comment.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                    color={comment.is_approved ? 'success' : 'warning'}
                                    variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(comment.created_at)}
                                </Typography>
                            </Stack>

                            <Typography variant="body2">{comment.body}</Typography>

                            {comment.parent_body && (
                                <Typography variant="caption" color="text.secondary">
                                    Trả lời: {comment.parent_body}
                                </Typography>
                            )}
                        </Stack>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
