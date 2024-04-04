import { Box } from '@mui/material';
import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function TabContent(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      id={`configuration-tab-content-${index}`}
      display={value === index ? 'flex' : 'none'}
      aria-labelledby={`tab-content-${index}`}
      style={{
        flexGrow: 1,
        margin: '6px',
        flexDirection: 'column',
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
