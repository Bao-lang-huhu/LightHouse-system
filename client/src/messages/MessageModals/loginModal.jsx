// Modal.js
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const CustomModal = ({ message, onConfirm, open }) => {
  return (
    <Modal
      open={open}
      onClose={onConfirm} // Trigger the onConfirm function when the modal is closed
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
          Session Expired
        </Typography>
        <Typography id="modal-description" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          fullWidth
        >
          OK
        </Button>
      </Box>
    </Modal>
  );
};

export default CustomModal;
