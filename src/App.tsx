import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet } from 'react-router-dom';
import { DashboardLayout, type Navigation } from '@toolpad/core';
import { createTheme } from '@mui/material/styles';

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
    title: 'Testing',
  },
  {
    segment: 'test',
    title: 'Test',
  },
];

const BRANDING = {
  title: 'Check 24 GenDev Challenge',
};

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
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
    <AppProvider navigation={NAVIGATION} branding={BRANDING} theme={demoTheme}>
        <Outlet />
    </AppProvider>
  );
}
