import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Typography,
    TextField
} from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Link,
    List,
    Indent,
    BlockQuote,
    Code,
    CodeBlock,
    Table,
    TableToolbar,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageInsert,
    Undo
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import './Editor.css';
import apiService from '@services/common';

export default function Editor({ value = '', onChange = () => { } }) {
    const [openMediaDialog, setOpenMediaDialog] = useState(false);
    const [mediaItems, setMediaItems] = useState([]);
    const [mediaKeyword, setMediaKeyword] = useState('');
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [editorInstance, setEditorInstance] = useState(null);

    useEffect(() => {
        if (!editorInstance) return;
        const html = value || '';
        if (editorInstance.getData() !== html) {
            editorInstance.setData(html);
        }
    }, [editorInstance, value]);

    const openMediaLibrary = async () => {
        setOpenMediaDialog(true);
        setLoadingMedia(true);
        try {
            const res = await apiService.get('media', { per_page: 200 });
            setMediaItems(res.data?.data || []);
        } catch (error) {
            setMediaItems([]);
        } finally {
            setLoadingMedia(false);
        }
    };

    const filteredMediaItems = useMemo(
        () =>
            mediaItems.filter((item) => {
                const isImage = String(item.mime_type || '').startsWith('image/');
                if (!isImage) return false;
                if (!mediaKeyword.trim()) return true;
                const text = `${item.name || ''} ${item.file_name || ''}`.toLowerCase();
                return text.includes(mediaKeyword.toLowerCase());
            }),
        [mediaItems, mediaKeyword]
    );

    const insertImageFromLibrary = (media) => {
        const src = media?.url || media?.thumb;
        if (!src || !editorInstance) return;

        try {
            editorInstance.execute('insertImage', { source: src });
        } catch {
            const currentData = editorInstance.getData() || '';
            editorInstance.setData(`${currentData}<p><img src="${src}" alt="" /></p>`);
        }

        setOpenMediaDialog(false);
    };

    return (
        <>
            <Box className="ckeditor-wrapper">
                <Box sx={{ mb: 1 }}>
                    <Button size="small" variant="outlined" onClick={openMediaLibrary}>
                        Media
                    </Button>
                </Box>
                <CKEditor
                    editor={ClassicEditor}
                    data={value || ''}
                    config={{
                        licenseKey: 'GPL',
                        plugins: [
                            Essentials,
                            Paragraph,
                            Heading,
                            Bold,
                            Italic,
                            Underline,
                            Strikethrough,
                            Link,
                            List,
                            Indent,
                            BlockQuote,
                            Code,
                            CodeBlock,
                            Table,
                            TableToolbar,
                            Image,
                            ImageToolbar,
                            ImageCaption,
                            ImageInsert,
                            Undo,
                        ],
                        toolbar: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'underline',
                            'strikethrough',
                            '|',
                            'link',
                            'bulletedList',
                            'numberedList',
                            '|',
                            'outdent',
                            'indent',
                            '|',
                            'blockQuote',
                            'code',
                            'codeBlock',
                            '|',
                            'insertTable',
                            'insertImage',
                            '|',
                            'undo',
                            'redo',
                        ],
                        heading: {
                            options: [
                                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                            ],
                        },
                        table: {
                            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
                        },
                        image: {
                            toolbar: [
                                'imageTextAlternative',
                            ],
                        },
                    }}
                    onReady={(editor) => {
                        setEditorInstance(editor);
                    }}
                    onChange={(_, editor) => {
                        onChange(editor.getData());
                    }}
                />
            </Box>

            <Dialog open={openMediaDialog} onClose={() => setOpenMediaDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Chọn ảnh từ kho media</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        placeholder="Tìm media..."
                        size="small"
                        fullWidth
                        value={mediaKeyword}
                        onChange={(event) => setMediaKeyword(event.target.value)}
                        sx={{ mb: 2 }}
                    />
                    {loadingMedia ? (
                        <Typography variant="body2">Đang tải media...</Typography>
                    ) : (
                        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                            {filteredMediaItems.map((media) => (
                                <Card key={media.id} sx={{ width: 140 }}>
                                    <CardActionArea onClick={() => insertImageFromLibrary(media)}>
                                        <CardMedia
                                            component="img"
                                            height="92"
                                            image={media.thumb || media.url}
                                            alt={media.name || media.file_name}
                                        />
                                        <CardContent sx={{ p: 1 }}>
                                            <Typography variant="caption" noWrap>
                                                {media.name || media.file_name || `#${media.id}`}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMediaDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
