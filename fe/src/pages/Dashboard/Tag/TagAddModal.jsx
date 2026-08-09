import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { tagSchema } from "./TagSchema";
import { slugify } from "@utils/common";

const TagAdd = ({ onSubmit, onClose }) => {
    const { t } = useTranslation("dashboard");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    });

    const submitHandler = (data) => {
        onSubmit({
            ...data,
            slug: data.slug || slugify(data.name),
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <Stack spacing={2}>
                <TextField
                    label={t("pages.tag.form.name")}
                    fullWidth
                    size="small"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <TextField
                    label={t("pages.tag.form.slug")}
                    fullWidth
                    size="small"
                    {...register("slug")}
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button
                        type="button"
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                        disabled={isSubmitting}
                        onClick={onClose}
                    >
                        {t("pages.tag.form.close")}
                    </Button>

                    <Button
                        type="submit"
                        sx={{ textTransform: "none" }}
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {t("pages.tag.form.save")}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default TagAdd;
