// src/components/ui/ErrorBoundary.tsx - Tuần 9: Error Boundary
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Đã xảy ra lỗi
          </Typography>
          <Alert severity="error" sx={{ mt: 2, mb: 2, maxWidth: 600 }}>
            <Typography variant="body1" gutterBottom>
              {this.state.error?.message || 'Một lỗi không mong muốn đã xảy ra'}
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {this.state.error.stack}
              </Typography>
            )}
          </Alert>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Thử lại
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

