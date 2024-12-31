import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet } from 'react-router-dom';
import { DashboardLayout, type Navigation } from '@toolpad/core';
import { createTheme } from '@mui/material/styles';
import './index.css';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'games',
    title: 'Games',
  },
  {
    segment: 'streaming_packages',
    title: 'Streaming Packages',
  },
  {
    segment: 'calculate_best_packages',
    title: 'Get Best Combination',
  },
  {
    segment: 'tournaments',
    title: 'Tournaments',
  },
];

const BRANDING = {
  title: 'Check 24 GenDev Challenge',
};

const dashboardTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: '#9ab9e0',
          paper: '#87accf',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#283e5c',
          paper: 'var(--primary)',
        },
        
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default function App() {
  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING} theme={dashboardTheme}>
      <Outlet />
    </AppProvider>
  );
}
