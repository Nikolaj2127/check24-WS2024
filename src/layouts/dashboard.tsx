import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  const location = useLocation()
  const collapesdRoutes = ['/calculate_best_packages/result', '/calculate_best_packages']
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(collapesdRoutes.includes(location.pathname))

  useEffect(() => {
    console.log('locpathname', location.pathname)
    console.log('isSidebarCollapes', isSidebarCollapsed)
    setIsSidebarCollapsed(collapesdRoutes.includes(location.pathname))
  }, [location.pathname])

  return (
    <DashboardLayout  defaultSidebarCollapsed={isSidebarCollapsed}>
        <PageContainer maxWidthLg>
          <Outlet />
        </PageContainer>
    </DashboardLayout>
  );
}
