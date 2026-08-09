// GlobalProvider.js
import React, { createContext, useState, useContext } from 'react'
import Notification from './partials/Notification'
import Loading from './partials/Loading'
import CustomModal from './partials/Modal'
import Drawer from './partials/Drawer'
import Confirm from './partials/Confirm'

const GlobalContext = createContext()

export const useGlobalContext = () => {
    return useContext(GlobalContext)
}

const GlobalProvider = ({ children }) => {

    const [confirm, setConfirm] = useState({
        open: false,
        title: '',
        content: '',
        onConfirm: () => { },
        onCancel: () => { }
    })
    const showConfirm = (title, content, onConfirm, onCancel) => {
        setConfirm({ open: true, title, content, onConfirm, onCancel });
    };
    const closeConfirm = () => {
        setConfirm({ open: false, title: '', content: '', onConfirm: () => { }, onCancel: () => { } });
    };

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info',
    })
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState(null)
    const [modalContent, setModalContent] = useState(null)

    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity })
    }

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false })
    }

    const showLoading = () => setLoading(true)
    const hideLoading = () => setLoading(false)

    const openModal = (title, content) => {
        setModalTitle(title)
        setModalContent(content)
        setModalOpen(true)
    }
    const closeModal = () => {
        setModalTitle(null)
        setModalContent(null)
        setModalOpen(false)
    }

    const [drawerTitle, setDrawerTitle] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);
    const [drawerCloseCallback, setDrawerCloseCallback] = useState(null);

    const openDrawer = ({ title, content, onCloseCallback = null }) => {
        setDrawerTitle(title);
        setDrawerContent(content);
        setDrawerOpen(true);
        setDrawerCloseCallback(() => {
            closeDrawer
            onCloseCallback
        });
    };

    const closeDrawer = () => {
        setDrawerTitle('');
        setDrawerContent(null);
        setDrawerOpen(false);
        if (drawerCloseCallback) drawerCloseCallback();
    };

    return (
        <GlobalContext.Provider
            value={{
                showNotification,
                showLoading,
                hideLoading,
                openModal,
                closeModal,
                openDrawer,
                closeDrawer,
                showConfirm,
                closeConfirm
            }}
        >
            {children}
            <Notification
                open={notification.open}
                handleClose={handleCloseNotification}
                message={notification.message}
                severity={notification.severity}
            />
            {loading && <Loading />}

            <CustomModal
                title={modalTitle}
                open={modalOpen}
                handleClose={closeModal}>
                {modalContent}
            </CustomModal>

            <Drawer
                drawerTitle={drawerTitle}
                drawerOpen={drawerOpen}
                drawerCloseCallback={drawerCloseCallback}
                closeDrawer={closeDrawer}
                drawerContent={drawerContent}
            />
            <Confirm
                title={confirm.title}
                content={confirm.content}
                open={confirm.open}
                closeConfirm={confirm.onCancel}
                onConfirm={confirm.onConfirm}
                onCancel={confirm.onCancel}
                onClose={closeConfirm}
            />
        </GlobalContext.Provider>
    )
}

export default GlobalProvider
