import { Typography, Button, Stack } from '@mui/material';
import MainCard from '@components/MainCard';
import { useGlobalContext } from '../../providers/GlobalProvider';

export default function Features() {
    const {
        showNotification,
        showLoading,
        hideLoading,
        openModal,
        closeModal,
        openDrawer,
        closeDrawer,
        showConfirm,
        closeConfirm
    } = useGlobalContext();

    return <MainCard
        pageTitle='Features'
        pageDescription='Features'
    >
        <Typography variant="h4" sx={{ my: 2 }}>Features</Typography>
        <Stack spacing={2} direction={'row'}>
            <Button onClick={showLoading} variant='outlined'>Loading</Button>
            <Button onClick={hideLoading} variant='outlined'>Hide Loading</Button>
            <Button onClick={() => showNotification('Chào em cô gái Lam Hồng', 'info')} variant='outlined'>
                Show Notification
            </Button>
            <Button onClick={() => openModal(
                "Chào em cô gái Lam Hồng"
            )} variant='outlined'>Open Modal</Button>
            <Button onClick={closeModal} variant='outlined'>Close Modal</Button>
            <Button onClick={() => openDrawer({ content: 'Đây là nội dung' })} variant='outlined'>Open Drawer</Button>
            <Button onClick={closeDrawer} variant='outlined'>Close Drawer</Button>

            <Button onClick={
                () => showConfirm({
                    title: 'Xác nhận xóa',
                    content: 'Bạn chắc muốn xoá?',
                    onConfirm: async () => { },
                    onCancel: () => { closeConfirm() }
                })
            }
                variant='outlined'>
                Show Confirm
            </Button>

            <Button onClick={closeConfirm} variant='outlined'>Close Confirm</Button>

        </Stack>

    </MainCard>;
}
