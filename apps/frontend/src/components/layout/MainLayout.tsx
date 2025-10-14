import { Box } from '@mui/material';
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUserStore } from '../../store/userStore';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useUserStore();

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
        <Header />
        <Box component="main" sx={{ maxWidth: '1200px', mx: 'auto', pt: 12, px: { xs: 2, md: 4 }, pb: 8 }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { md: '240px' } }}>
        <Header />
        <Box component="main" sx={{ pt: 12, px: { xs: 2, md: 4 }, pb: 8 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
