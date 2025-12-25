import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden md:flex flex-col border-r z-20"
      />

      {/* Sidebar - Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute left-0 top-0 h-full w-64" onClick={e => e.stopPropagation()}>
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              className="flex h-full"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/20 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
