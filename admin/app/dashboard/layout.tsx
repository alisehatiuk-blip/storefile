'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, init } = useAdminAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate store from localStorage
    init();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push('/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.15)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f1a' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginRight: sidebarOpen ? '260px' : '0px',
        transition: 'margin 0.3s ease',
        minWidth: 0,
      }}>
        <AdminTopbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
