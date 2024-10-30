import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet } from 'react-router-dom';
import type { Navigation } from '@toolpad/core';

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
    title: 'Calculate Best Package Combination',
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

export default function App() {
  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </AppProvider>
  );
}
