import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const MediaAdd = ({ onSubmit, onClose }) => {
    const { t } = useTranslation('dashboard');
    const [name, setName] = useState('');
    const [collection, setCollection] = useState('library');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const submitHandler = async (event) => {
        event.preventDefault();

        if (!file) {
            setError('Vui lòng chọn file');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('collection', collection || 'library');
            if (name.trim() !== '') {
                formData.append('name', name.trim());
            }

            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={submitHandler} noValidate>
            <Stack spacing={2}>
                <TextField
                    label={t('pages.media.form.name')}
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <TextField
                    label="Collection"
                    fullWidth
                    size="small"
                    value={collection}
                    onChange={(event) => setCollection(event.target.value)}
                />

                <Button component="label" variant="outlined">
                    {file ? file.name : 'Chọn file media'}
                    <input
                        hidden
                        type="file"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                    />
                </Button>

                {error && (
                    <Typography variant="caption" color="error">
                        {error}
                    </Typography>
                )}

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button
                        type="button"
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        disabled={isSubmitting}
                        onClick={onClose}
                    >
                        {t('pages.media.form.close')}
                    </Button>

                    <Button
                        type="submit"
                        sx={{ textTransform: 'none' }}
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {t('pages.media.form.save')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default MediaAdd;
