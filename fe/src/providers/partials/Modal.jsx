// Modal.js
import React from 'react'
import { Modal, Box, IconButton, Typography, Stack } from '@mui/material'
import { Close } from "@mui/icons-material"

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
}

const CustomModal = ({ open, handleClose, children, title }) => {
    return (
        <Modal open={open} onClose={handleClose}>
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
                        onClick={handleClose}
                        size="small"
                        sx={{ color: 'grey.500' }}
                    >
                        <Close />
                    </IconButton>
                </Stack>

                {children}
            </Box>
        </Modal>
    )
}

export default CustomModal
