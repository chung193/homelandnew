import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Stack,
    TextField,
    Checkbox,
    MenuItem,
    FormControlLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { categorySchema } from "./CategorySchema";
import { getAll } from "./CategoryServices.js";
import { slugify } from "@utils/common";

const CategoryAdd = ({ onSubmit, onClose }) => {
    const { t } = useTranslation("dashboard");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getAll();
                setCategories(res.data.data || []);
            } catch (err) {
                console.log(err);
            }
        };

        fetchCategories();
    }, []);

    const {
        control,
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            parent_id: 0,
            sort_order: 0,
            is_active: true,
        },
    });

    const submitHandler = (data) => {
        const payload = {
            ...data,
            slug: data.slug || slugify(data.name),
            parent_id: data.parent_id || 0,
            sort_order: data.sort_order || 0,
        };

        onSubmit(payload);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                <TextField
                    label={t("pages.category.form.name")}
                    fullWidth
                    size="small"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <TextField
                    label={t("pages.category.form.slug")}
                    fullWidth
                    size="small"
                    {...register("slug")}
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                />

                <Controller
                    name="parent_id"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            size="small"
                            label={t("pages.category.form.parent_id")}
                            error={!!errors.parent_id}
                            helperText={errors.parent_id?.message}
                        >
                            <MenuItem value={0}>-- Danh mục gốc --</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <TextField
                    label={t("pages.category.form.order")}
                    fullWidth
                    type="number"
                    size="small"
                    {...register("sort_order", { valueAsNumber: true })}
                    error={!!errors.sort_order}
                    helperText={errors.sort_order?.message}
                />

                <FormControlLabel
                    control={<Checkbox {...register("is_active")} defaultChecked />}
                    label={t("pages.category.form.is_active")}
                />

                <TextField
                    label={t("pages.category.form.description")}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    {...register("description")}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button
                        type="button"
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                        disabled={isSubmitting}
                        onClick={onClose}
                    >
                        {t("pages.category.form.close")}
                    </Button>

                    <Button
                        type="submit"
                        sx={{ textTransform: "none" }}
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {t("pages.category.form.save")}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default CategoryAdd;
