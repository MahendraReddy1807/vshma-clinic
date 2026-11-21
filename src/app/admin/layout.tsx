'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Inbox,
  CheckSquare,
  Bell,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import BrandLogo from '@/components/ui/BrandLogo';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';

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
      name: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Inbox',
      href: '/admin/inbox',
      icon: Inbox,
    },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: CalendarDays,
    },
    {
      name: 'Patients',
      href: '/admin/patients',
      icon: Users,
    },
    {
      name: 'Follow-ups',
      href: '/admin/follow-ups',
      icon: CheckSquare,
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Knowledge Base',
      href: '/admin/knowledge-base',
      icon: BookOpen,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      <AdminCommandPalette />
      <div className="min-h-screen bg-[#F7F3EC] text-[#161815] flex flex-col md:flex-row font-sans">
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-[#121A15] text-white px-4 py-3 flex items-center justify-between border-b border-[#B89B5E]/30">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" theme="light" showSubtitle={false} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:sticky top-0 h-screen z-40 w-64 bg-[#121A15] text-[#EDE6D3] flex flex-col justify-between border-r border-[#B89B5E]/30 transition-transform duration-200 md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Logo / Branding */}
            <div className="p-5 border-b border-white/10">
              <BrandLogo size="sm" theme="light" showSubtitle={true} />
            </div>

            {/* Quick Command Palette Button */}
            <div className="px-4 py-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#B89B5E]/30 text-xs text-[#EDE6D3]/70 hover:text-white transition-colors cursor-pointer"
              >
                <span>Quick Search...</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#B89B5E]">⌘K</kbd>
              </button>
            </div>

            {/* Current Admin badge */}
            <div className="px-5 py-3 bg-black/20 border-b border-white/10 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B89B5E] shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#B89B5E] truncate">Staff Workspace</p>
                <p className="text-xs text-white truncate font-medium">{adminEmail || 'admin@vshma.in'}</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="p-3 space-y-1 mt-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin/dashboard'
                    ? pathname === '/admin/dashboard' || pathname === '/admin'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#1A261F] text-[#D4D8BA] border border-[#B89B5E]/40 font-semibold shadow-2xs'
                        : 'text-[#EDE6D3]/75 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#B89B5E]' : 'text-[#EDE6D3]/60'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10 space-y-1.5 bg-[#0F1612]">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#EDE6D3]/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span>Live Patient Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B89B5E]" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Administrative Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </>
  );
}
