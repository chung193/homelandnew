import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Avatar,
    Card,
    CardActionArea,
    CardMedia,
    CardContent
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { pageSchema } from './PageSchema';
import Editor from '@components/Editor';
import contentType from '@data/type';
import contentStatus from '@data/status';
import { uploadImage, getMediaLibrary } from './PageServices';
import { generateSlug } from '@utils/stringHelper';

const PageAdd = ({
    onSubmit,
    onClose,
    onBackToList,
    mode = 'create',
    recordId = null,
    initialData = null,
}) => {
    const { t } = useTranslation('dashboard');
    const [preview, setPreview] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaLibrary, setMediaLibrary] = useState([]);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);

    useEffect(() => {
        getMediaLibrary()
            .then((res) => setMediaLibrary(res.data.data || []))
            .catch((error) => console.error('Load media library failed:', error));
    }, []);

    const libraryMap = useMemo(
        () => new Map(mediaLibrary.map((media) => [media.id, media])),
        [mediaLibrary]
    );

    const handleAvatar = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setSelectedFile(file);
        setSelectedMedia(null);
    };

    const selectLibraryMedia = (media) => {
        setSelectedMedia(media);
        setSelectedFile(null);
        setPreview(media.thumb || media.url || '');
    };

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(pageSchema),
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            content: '',
            status: 'draft',
            type: 'article',
            views: 0,
            published_at: '',
            featured: false,
            allow_comments: false,
        },
    });

    // Watch name field to auto-generate slug
    const nameValue = watch("name");
    useEffect(() => {
        if (mode === "create" && nameValue) {
            setValue("slug", generateSlug(nameValue));
        }
    }, [nameValue, mode, setValue]);

    useEffect(() => {
        if (mode !== 'edit' || !initialData) return;

        reset({
            name: initialData.name || '',
            slug: initialData.slug || '',
            description: initialData.description || '',
            content: initialData.content || '',
            status: initialData.status || 'draft',
            type: initialData.type || 'article',
            views: Number(initialData.views || 0),
            published_at: initialData.published_at
                ? String(initialData.published_at).replace(' ', 'T').slice(0, 16)
                : '',
            featured: Boolean(initialData.featured),
            allow_comments: Boolean(initialData.allow_comments),
        });

        setSelectedMedia(initialData.featured_media || null);
        setPreview(
            initialData.featured_media?.thumb ||
            initialData.featured_media?.url ||
            initialData.avatar ||
            ''
        );
        setSelectedFile(null);
    }, [mode, initialData, reset]);

    const submitHandler = async (data) => {
        try {
            const payload = {
                ...data,
                views: Number(data.views || 0),
                featured_media_id: selectedMedia?.id ?? null,
            };

            if (mode === 'edit' && recordId) {
                const res = await onSubmit(payload, recordId);

                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('model', 'Page');
                    formData.append('id', recordId);
                    formData.append('collection', 'cover');
                    await uploadImage(formData);
                }

                return res;
            }

            const res = await onSubmit(payload);
            const pageId = res?.data?.data?.id;

            if (!pageId) return res;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('model', 'Page');
                formData.append('id', pageId);
                formData.append('collection', 'cover');
                await uploadImage(formData);
            }

            return res;
        } catch (error) {
            console.error('Submit error:', error);
            throw error;
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(submitHandler)}
            noValidate
            sx={{ width: 700 }}
        >
            <Stack spacing={2}>
                <TextField
                    label={t('pages.page.form.name')}
                    fullWidth
                    size="small"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <TextField
                    label={t('pages.page.form.slug')}
                    fullWidth
                    size="small"
                    {...register('slug')}
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                />

                <TextField
                    label={t('pages.page.form.description')}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                />

                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Typography>
                                {t('pages.page.form.content')}
                            </Typography>

                            <Editor
                                value={field.value}
                                onChange={field.onChange}
                            />

                            {errors.content && (
                                <Typography
                                    variant="caption"
                                    color="error"
                                >
                                    {errors.content.message}
                                </Typography>
                            )}
                        </>
                    )}
                />

                <TextField
                    select
                    label={t('pages.page.form.status')}
                    size="small"
                    fullWidth
                    {...register('status')}
                    error={!!errors.status}
                    helperText={errors.status?.message}
                >
                    {contentStatus.map((item) => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label={t('pages.page.form.type')}
                    size="small"
                    fullWidth
                    {...register('type')}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                >
                    {contentType.map((item) => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label={t('pages.page.form.views')}
                    type="number"
                    size="small"
                    fullWidth
                    {...register('views', { valueAsNumber: true })}
                    error={!!errors.views}
                    helperText={errors.views?.message}
                />

                <TextField
                    label={t('pages.page.form.published_at')}
                    type="datetime-local"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    {...register('published_at')}
                    error={!!errors.published_at}
                    helperText={errors.published_at?.message}
                />

                <FormControlLabel
                    control={
                        <Checkbox {...register('featured')} />
                    }
                    label={t('pages.page.form.featured')}
                />

                <FormControlLabel
                    control={
                        <Checkbox {...register('allow_comments')} />
                    }
                    label={t('pages.page.form.allow_comments')}
                />

                <Stack direction="row" spacing={1}>
                    <Button component="label" startIcon={<PhotoCamera />}>
                        Upload anh moi
                        <input hidden type="file" accept="image/*" onChange={handleAvatar} />
                    </Button>
                    <Button variant="outlined" onClick={() => setShowMediaLibrary((prev) => !prev)}>
                        {showMediaLibrary ? 'Ẩn kho media' : 'Chọn từ kho media'}
                    </Button>
                </Stack>

                <Box textAlign="center" position="relative" sx={{ mb: 1 }}>
                    <Avatar
                        src={preview}
                        sx={{
                            width: 120,
                            height: 120,
                            mx: 'auto',
                            border: '4px solid #2c3e50',
                        }}
                    />
                    {selectedMedia && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Đã chọn media ID: {selectedMedia.id}
                        </Typography>
                    )}
                </Box>

                {showMediaLibrary && (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, maxHeight: 280, overflow: 'auto' }}>
                        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                            {mediaLibrary.map((media) => {
                                const active = selectedMedia?.id === media.id;
                                return (
                                    <Card key={media.id} sx={{ width: 120, border: active ? '2px solid' : '1px solid', borderColor: active ? 'primary.main' : 'divider' }}>
                                        <CardActionArea onClick={() => selectLibraryMedia(media)}>
                                            <CardMedia
                                                component="img"
                                                height="84"
                                                image={media.thumb || media.url}
                                                alt={media.name || media.file_name}
                                            />
                                            <CardContent sx={{ p: 1 }}>
                                                <Typography variant="caption" noWrap>
                                                    {(libraryMap.get(media.id)?.name || media.file_name || `#${media.id}`)}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                );
                            })}
                        </Stack>
                    </Box>
                )}

                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={1}
                >
                    {mode === 'edit' && typeof onBackToList === 'function' && (
                        <Button
                            type="button"
                            variant="text"
                            sx={{ textTransform: 'none', mr: 'auto' }}
                            disabled={isSubmitting}
                            onClick={onBackToList}
                        >
                            Back to list
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        disabled={isSubmitting}
                        onClick={onClose}
                    >
                        {t('pages.page.form.close')}
                    </Button>

                    <Button
                        type="submit"
                        sx={{ textTransform: 'none' }}
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {mode === 'edit' ? 'Update' : t('pages.page.form.save')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default PageAdd;
