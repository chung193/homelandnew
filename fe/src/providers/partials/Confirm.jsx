import { Modal, Button, Stack, Typography, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const style = {
    backgroundColor: '#fff',
    color: '#262626',
    position: 'absolute',
    boxShadow: 'inherit',
    padding: 2,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
    borderRadius: 1,
    minWidth: 340,
};

const Confirm = ({
    title = '',
    content = '',
    open = false,
    onClose = () => { },
    onConfirm = async () => { },
    onCancel = () => { },
}) => {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await onConfirm();      // chạy logic confirm (API, delete…)
            onClose();              // đóng modal khi thành công
        } catch (error) {
            console.error('Confirm error:', error);
            //không auto đóng nếu lỗi (UX đúng hơn)
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (loading) return;
        onCancel();
        onClose();
    };

    return (
        <Modal
            open={open}
            keepMounted
            onClose={handleCancel}
        >
            <Box sx={style}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        {title}
                    </Typography>

                    <IconButton
                        aria-label="close"
                        onClick={handleCancel}
                        size="small"
                        sx={{ color: 'grey.500' }}
                        disabled={loading}
                    >
                        <Close />
                    </IconButton>
                </Stack>

                <Typography sx={{ mb: 3 }}>
                    {content}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                        onClick={handleCancel}
                        variant="outlined"
                        disabled={loading}
                    >
                        {t('cancel')}
                    </Button>

                    <Button
                        onClick={handleConfirm}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? t('loadingProcessing') : t('confirm')}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default Confirm;
