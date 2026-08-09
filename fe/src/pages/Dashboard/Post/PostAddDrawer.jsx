import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    CardContent,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { postSchema } from "./PostSchema";
import Editor from "@components/Editor";
import TagInput from "./TagInput";
import contentType from "@data/type";
import contentStatus from "@data/status";
import { uploadImage, getAllCategory, getAllTag, createTag, getMediaLibrary } from "./PostServices";
import { generateSlug } from "@utils/stringHelper";

const PostAdd = ({
    onSubmit,
    onClose,
    onBackToList,
    mode = "create",
    recordId = null,
    initialData = null,
}) => {
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [mediaLibrary, setMediaLibrary] = useState([]);
    const { t } = useTranslation("dashboard");

    useEffect(() => {
        Promise.all([
            getAllCategory({ per_page: 200 }),
            getAllTag({ per_page: 200 }),
            getMediaLibrary(),
        ])
            .then(([categoryRes, tagRes, mediaRes]) => {
                setCategories(categoryRes.data.data || []);
                setTags(tagRes.data.data || []);
                setMediaLibrary(mediaRes.data.data || []);
            })
            .catch((err) => {
                console.error("Lỗi lấy dữ liệu post form:", err);
            });
    }, []);

    const [preview, setPreview] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);

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
        setPreview(media.thumb || media.url || "");
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
        resolver: zodResolver(postSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            content: "",
            status: "draft",
            type: "article",
            category_id: 0,
            views: 0,
            published_at: "",
            featured: false,
            allow_comments: false,
            tags: [],
        },
    });

    // Watch name and slug fields
    const nameValue = watch("name");
    const slugValue = watch("slug");

    // Generate slug immediately when name changes
    useEffect(() => {
        if (nameValue && mode === "create") {
            const generated = generateSlug(nameValue);
            console.log("Slug generation - name:", nameValue, "generated:", generated);
            // Only update if slug is empty - don't validate yet
            if (!slugValue || slugValue === "") {
                console.log("Setting slug to:", generated);
                setValue("slug", generated, { shouldValidate: false });
            }
        }
    }, [nameValue, mode, setValue, slugValue]);

    useEffect(() => {
        if (mode !== "edit" || !initialData) return;

        reset({
            name: initialData.name || "",
            slug: initialData.slug || "",
            description: initialData.description || "",
            content: initialData.content || "",
            status: initialData.status || "draft",
            type: initialData.type || "article",
            category_id: Number(initialData.category_id || 0),
            views: Number(initialData.views || 0),
            published_at: initialData.published_at
                ? String(initialData.published_at).replace(" ", "T").slice(0, 16)
                : "",
            featured: Boolean(initialData.featured),
            allow_comments: Boolean(initialData.allow_comments),
            tags: Array.isArray(initialData.tags) ? initialData.tags.map((tag) => tag.id) : [],
        });

        setSelectedMedia(initialData.featured_media || null);
        setPreview(
            initialData.featured_media?.thumb ||
            initialData.featured_media?.url ||
            initialData.avatar ||
            ""
        );
        setSelectedFile(null);
    }, [mode, initialData, reset]);

    const libraryMap = useMemo(
        () => new Map(mediaLibrary.map((media) => [media.id, media])),
        [mediaLibrary]
    );

    const submitHandler = async (data) => {
        try {
            // Ensure slug always has a value before sending
            let slug = (data.slug || "").trim();

            // If slug is empty and we have name, generate it
            if (!slug && data.name) {
                slug = generateSlug(data.name);
            }

            // Log for debugging
            console.log("Submit - name:", data.name, "slug:", slug, "data.slug:", data.slug);

            // Validate slug exists
            if (!slug) {
                throw new Error("Không thể tạo slug từ tên bài viết");
            }

            const payload = {
                ...data,
                slug: slug,
                category_id: Number(data.category_id || 0),
                views: Number(data.views || 0),
                tags: Array.isArray(data.tags) ? data.tags : [],
                featured_media_id: selectedMedia?.id ?? null,
            };

            console.log("Payload to send:", payload);

            if (mode === "edit" && recordId) {
                const res = await onSubmit(payload, recordId);
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("file", selectedFile);
                    formData.append("model", "Post");
                    formData.append("id", recordId);
                    formData.append("collection", "cover");
                    await uploadImage(formData);
                }
                return res;
            }

            const res = await onSubmit(payload);
            const postId = res?.data?.data?.id;
            if (!postId) return res;

            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("model", "Post");
                formData.append("id", postId);
                formData.append("collection", "cover");
                await uploadImage(formData);
            }
            return res;
        } catch (error) {
            console.error("Submit error:", error);
            throw error;
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(submitHandler)}
            onKeyDown={(e) => {
                // Block form submission on Enter key
                if (e.key === "Enter" && e.target !== e.currentTarget) {
                    // Allow Enter only in textarea and contenteditable elements
                    const allowEnter =
                        e.target.tagName === "TEXTAREA" ||
                        e.target.contentEditable === "true" ||
                        e.target.getAttribute("role") === "button";

                    if (!allowEnter) {
                        e.preventDefault();
                    }
                }
            }}
            noValidate
            sx={{ width: 700 }}
        >
            <Stack spacing={2}>
                <TextField
                    label={t("pages.post.form.name")}
                    fullWidth
                    size="small"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <TextField
                    label={t("pages.post.form.slug")}
                    fullWidth
                    size="small"
                    {...register("slug")}
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                />

                <TextField
                    label={t("pages.post.form.description")}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    {...register("description")}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                />

                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Typography>{t("pages.post.form.content")}</Typography>
                            <Editor value={field.value} onChange={field.onChange} />
                            {errors.content && (
                                <Typography variant="caption" color="error">
                                    {errors.content.message}
                                </Typography>
                            )}
                        </>
                    )}
                />

                <TextField
                    select
                    label={t("pages.post.form.status")}
                    size="small"
                    fullWidth
                    {...register("status")}
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
                    label={t("pages.post.form.category")}
                    size="small"
                    fullWidth
                    {...register("category_id", { valueAsNumber: true })}
                    error={!!errors.category_id}
                    helperText={errors.category_id?.message}
                >
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            {category.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                        <TagInput
                            {...field}
                            tags={tags}
                            error={!!errors.tags}
                            helperText={errors.tags?.message}
                            onCreateTag={(tagName) =>
                                createTag({ name: tagName })
                            }
                        />
                    )}
                />

                <TextField
                    select
                    label={t("pages.post.form.type")}
                    size="small"
                    fullWidth
                    {...register("type")}
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
                    label={t("pages.post.form.views")}
                    type="number"
                    size="small"
                    fullWidth
                    {...register("views", { valueAsNumber: true })}
                    error={!!errors.views}
                    helperText={errors.views?.message}
                />

                <TextField
                    label={t("pages.post.form.published_at")}
                    type="datetime-local"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    {...register("published_at")}
                    error={!!errors.published_at}
                    helperText={errors.published_at?.message}
                />

                <FormControlLabel control={<Checkbox {...register("featured")} />} label={t("pages.post.form.featured")} />
                <FormControlLabel control={<Checkbox {...register("allow_comments")} />} label={t("pages.post.form.allow_comments")} />

                <Stack direction="row" spacing={1}>
                    <Button component="label" startIcon={<PhotoCamera />}>
                        Upload anh moi
                        <input hidden type="file" accept="image/*" onChange={handleAvatar} />
                    </Button>
                    <Button variant="outlined" onClick={() => setShowMediaLibrary((prev) => !prev)}>
                        {showMediaLibrary ? "Ẩn kho media" : "Chọn từ kho media"}
                    </Button>
                </Stack>

                <Box textAlign="center" position="relative" sx={{ mb: 1 }}>
                    <Avatar src={preview} sx={{ width: 120, height: 120, mx: "auto", border: "4px solid #2c3e50" }} />
                    {selectedMedia && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Đã chọn media ID: {selectedMedia.id}
                        </Typography>
                    )}
                </Box>

                {showMediaLibrary && (
                    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1, maxHeight: 280, overflow: "auto" }}>
                        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                            {mediaLibrary.map((media) => {
                                const active = selectedMedia?.id === media.id;
                                return (
                                    <Card key={media.id} sx={{ width: 120, border: active ? "2px solid" : "1px solid", borderColor: active ? "primary.main" : "divider" }}>
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

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    {mode === "edit" && typeof onBackToList === "function" && (
                        <Button
                            type="button"
                            variant="text"
                            sx={{ textTransform: "none", mr: "auto" }}
                            disabled={isSubmitting}
                            onClick={onBackToList}
                        >
                            Back to list
                        </Button>
                    )}
                    <Button type="button" variant="outlined" sx={{ textTransform: "none" }} disabled={isSubmitting} onClick={onClose}>
                        {t("pages.post.form.close")}
                    </Button>
                    <Button type="submit" sx={{ textTransform: "none" }} variant="contained" disabled={isSubmitting}>
                        {mode === "edit" ? "Update" : t("pages.post.form.save")}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default PostAdd;
