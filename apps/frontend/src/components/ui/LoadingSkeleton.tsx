// src/components/ui/LoadingSkeleton.tsx - Tuần 9: Loading Skeleton
import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'list';
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card', rows = 3 }) => {
  if (variant === 'table') {
    return (
      <Box>
        {[...Array(rows)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width="10%" height={40} />
            <Skeleton variant="rectangular" width="20%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="10%" height={40} />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'list') {
    return (
      <Box>
        {[...Array(rows)].map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {[...Array(rows)].map((_, i) => (
        <Card key={i} sx={{ width: 300 }}>
          <Skeleton variant="rectangular" width="100%" height={200} />
          <CardContent>
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={20} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default LoadingSkeleton;

