import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet } from 'react-router-dom';
import { DashboardLayout, type Navigation } from '@toolpad/core';

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
  {
    segment: 'collections',
    title: 'Collections',
  },
  {
    kind: 'header',
    title: 'AI Training',
  },
  {
    segment: 'nNTraining',
    title: 'Train Neural Network',
  },
];

const BRANDING = {
  title: 'Check 24 GenDev Challenge',
};

export default function App() {
  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING}>
        <Outlet />
    </AppProvider>
  );
}
