import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Chatbot } from '@/components/Chatbot';
import { AppHeader } from './AppHeader';
import { PageLoader } from '@/components/guards';
import { PublicHeader } from '@/components/layouts/PublicHeader';
import { PublicFooter } from '@/components/layouts/PublicFooter';

export { AuthLayout } from '@/components/layouts/AuthLayout';

const PageContent: React.FC = () => (
  <div className="p-4 ">
    <Outlet />
  </div>
);

export const PrivateLayout: React.FC = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden pt-16 sm:pt-20 md:pt-0">
          <Suspense fallback={<PageLoader />}>
            <PageContent />
          </Suspense>
        </main>
      </div>
      <Chatbot />
    </div>
  </SidebarProvider>
);

export const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-background">
    <PublicHeader />
    <Suspense fallback={<PageLoader />}>
      <main className="pt-20 sm:pt-24">
        <Outlet />
      </main>
    </Suspense>
    <PublicFooter />
  </div>
);

export const AdminLayout: React.FC = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden pt-16 sm:pt-20 md:pt-0">
          <Suspense fallback={<PageLoader />}>
            <PageContent />
          </Suspense>
        </main>
      </div>
      <Chatbot />
    </div>
  </SidebarProvider>
);

export const BareLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background">
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </div>
);