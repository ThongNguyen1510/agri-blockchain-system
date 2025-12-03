// src/components/ui/ToastProvider.tsx - Tuần 9: Toast notifications
import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useToastStore } from '../../store/toastStore';

const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 6000}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => removeToast(toast.id)}
            severity={toast.type as AlertColor}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastProvider;

