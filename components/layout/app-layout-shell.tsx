'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { AuthProvider } from '@/context/auth-context';

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';

  if (isAuthPage) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground flex">
        <Sidebar />
        <div className="flex-1 ml-sidebar-width flex flex-col min-h-screen">
          <TopNavbar />
          <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
