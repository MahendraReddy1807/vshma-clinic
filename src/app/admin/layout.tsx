'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import BrandLogo from '@/components/ui/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  
  const [authorized, setAuthorized] = useState(isLoginPage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    if (isLoginPage) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    const email = typeof window !== 'undefined' ? (localStorage.getItem('vshma_admin_email') || '') : '';
    
    if (!token) {
      router.replace('/admin/login');
    } else {
      setTimeout(() => {
        setAdminEmail(email);
        setAuthorized(true);
      }, 0);
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      await createBrowserSupabaseClient().auth.signOut();
    }
    localStorage.removeItem('vshma_admin_session');
    localStorage.removeItem('vshma_admin_email');
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-forest">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Overview Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-forest text-white px-4 py-3 flex items-center justify-between border-b border-forest-light">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" theme="light" showSubtitle={false} />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-forest-light text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-forest text-white flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Branding */}
          <div className="p-6 border-b border-forest-light/60">
            <BrandLogo size="sm" theme="light" showSubtitle={true} />
          </div>

          {/* Current Admin badge */}
          <div className="px-6 py-4 bg-forest-dark/40 border-b border-forest-light/40 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[11px] text-sage truncate font-medium">Logged in as</p>
              <p className="text-xs text-white truncate font-semibold">{adminEmail}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-light text-gold shadow-sm font-semibold'
                      : 'text-sage-light hover:bg-forest-light/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-forest-light/60 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-sage hover:text-white hover:bg-forest-light/40 transition-colors"
          >
            <span>View Live Clinic Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-200 hover:bg-red-500/20 hover:text-white transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
