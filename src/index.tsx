import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages/index';
import GamesPage from './pages/games';
import StreamingPackagesPage from './pages/streamingPackages';
import CalculateBestPackagesPage from './pages/calculateBestPackages';
import Result from './pages/result';
import Tournament from './pages/tournament';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: DashboardPage,
          },
          {
            path: '/games',
            Component: GamesPage,
          },
          {
            path: '/streaming_packages',
            Component: StreamingPackagesPage,
          },
          {
            path: '/calculate_best_packages',
            Component: CalculateBestPackagesPage,
          },
          {
            path: '/tournaments',
            Component: Tournament,
          },
          {
            path: '/calculate_best_packages/result',
            Component: Result,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
