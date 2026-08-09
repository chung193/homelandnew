import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    Autocomplete,
    TextField,
    Chip,
    CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export const TagInput = React.forwardRef(
    ({ value = [], onChange, tags = [], onCreateTag, error, helperText }, ref) => {
        const { t } = useTranslation("dashboard");
        const [inputValue, setInputValue] = useState("");
        const [loading, setLoading] = useState(false);
        const [localTags, setLocalTags] = useState(tags);

        useEffect(() => {
            setLocalTags(tags);
        }, [tags]);

        // Map tag IDs to tag objects for display
        const selectedTags = useMemo(() => {
            if (!Array.isArray(value)) return [];
            return value.map((id) => {
                const tag = localTags.find((t) => t.id === id || t.id === Number(id));
                return tag || { id: Number(id), name: `Tag #${id}` };
            });
        }, [value, localTags]);

        // Filter tags that are not already selected
        const availableTags = useMemo(() => {
            return localTags.filter(
                (tag) => !selectedTags.some((selected) => selected.id === tag.id)
            );
        }, [localTags, selectedTags]);

        const handleAddTag = useCallback(
            async (newTag) => {
                if (!newTag || !newTag.name) return;

                let tagToAdd = newTag;

                // If it's a new tag (without ID), create it first
                if (!newTag.id && typeof onCreateTag === "function") {
                    setLoading(true);
                    try {
                        const result = await onCreateTag(newTag.name);
                        const createdTag = result?.data?.data;
                        if (createdTag) {
                            tagToAdd = createdTag;
                            // Update local tags list
                            setLocalTags((prev) => [...prev, createdTag]);
                        } else {
                            console.error("Lỗi: không nhận được tag mới từ server");
                            return;
                        }
                    } catch (error) {
                        console.error("Lỗi tạo tag:", error);
                        return;
                    } finally {
                        setLoading(false);
                    }
                }

                if (tagToAdd?.id) {
                    const newIds = Array.from(
                        new Set([
                            ...selectedTags.map((t) => t.id),
                            Number(tagToAdd.id),
                        ])
                    );
                    onChange(newIds);
                    setInputValue("");
                }
            },
            [selectedTags, onChange, onCreateTag]
        );

        const handleRemoveTag = useCallback(
            (tagId) => {
                const newValues = selectedTags.filter((tag) => tag.id !== tagId);
                onChange(newValues.map((t) => t.id));
            },
            [selectedTags, onChange]
        );

        return (
            <Autocomplete
                ref={ref}
                freeSolo
                multiple
                value={selectedTags}
                onChange={(event, newValue) => {
                    const tagIds = newValue
                        .map((item) => {
                            if (typeof item === "string") {
                                const existing = localTags.find(
                                    (t) =>
                                        t.name.toLowerCase() ===
                                        item.toLowerCase()
                                );
                                return existing?.id;
                            }
                            return item?.id;
                        })
                        .filter((id) => id !== undefined && id !== null)
                        .map(Number);

                    onChange(tagIds);
                    setInputValue("");
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        event.stopPropagation();
                        event.nativeEvent?.stopImmediatePropagation?.();

                        if (inputValue.trim()) {
                            const trimmedInput = inputValue.trim();

                            const existingTag = localTags.find(
                                (tag) =>
                                    tag.name.toLowerCase() ===
                                    trimmedInput.toLowerCase()
                            );

                            if (existingTag) {
                                handleAddTag(existingTag);
                            } else {
                                handleAddTag({ name: trimmedInput });
                            }
                        }
                    }
                }}
                options={availableTags}
                getOptionLabel={(option) => {
                    if (typeof option === "string") {
                        return option;
                    }
                    return option?.name || "";
                }}
                isOptionEqualToValue={(option, value) => {
                    if (typeof option === "string" || typeof value === "string") {
                        return false;
                    }
                    return Number(option?.id) === Number(value?.id);
                }}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <Chip
                            label={option?.name || option}
                            onDelete={() => {
                                const newIds = selectedTags
                                    .filter((_, i) => i !== index)
                                    .map((t) => t.id);
                                onChange(newIds);
                            }}
                            key={option?.id || index}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={t("pages.post.form.tags") || "Tags"}
                        placeholder={
                            selectedTags.length === 0
                                ? t("pages.post.form.tagsPlaceholder") ||
                                "Nhập hoặc chọn tag, rồi nhấn Enter"
                                : ""
                        }
                        error={error}
                        helperText={helperText}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading && (
                                        <CircularProgress
                                            color="inherit"
                                            size={20}
                                        />
                                    )}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                noOptionsText={
                    inputValue.trim()
                        ? `Nhấn Enter để tạo tag "${inputValue.trim()}"`
                        : "Không có tag"
                }
                loadingText="Đang tạo tag..."
            />
        );
    }
);

TagInput.displayName = "TagInput";

export default TagInput;
