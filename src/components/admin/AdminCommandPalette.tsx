'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Users,
  Bell,
  Settings,
  Plus,
  LogOut,
  X,
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  category: 'Navigation' | 'Actions';
  icon: React.ElementType;
  href?: string;
  action?: () => void;
}

export default function AdminCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const commands: CommandItem[] = [
    { id: 'dash', name: 'Dashboard Overview', category: 'Navigation', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'inbox', name: 'Unified Patient Inbox', category: 'Navigation', icon: Inbox, href: '/admin/inbox' },
    { id: 'appts', name: 'Manage Appointments', category: 'Navigation', icon: CalendarDays, href: '/admin/appointments' },
    { id: 'patients', name: 'Patient Directory & Dossiers', category: 'Navigation', icon: Users, href: '/admin/patients' },
    { id: 'notifs', name: 'Notification Logs & Audit', category: 'Navigation', icon: Bell, href: '/admin/notifications' },
    { id: 'settings', name: 'Clinic Settings & Channels', category: 'Navigation', icon: Settings, href: '/admin/settings' },
    {
      id: 'new-chat',
      name: 'Start New Patient Conversation',
      category: 'Actions',
      icon: Plus,
      action: () => {
        router.push('/admin/inbox');
      },
    },
    {
      id: 'logout',
      name: 'Sign Out Administrator',
      category: 'Actions',
      icon: LogOut,
      action: () => {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
      },
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#121A15]/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 select-none"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#FAF8F2] rounded-3xl border border-[#B89B5E]/40 shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D8D0BD]/60 bg-white">
          <Search className="w-5 h-5 text-[#B89B5E] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to page... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#121A15] placeholder-[#121A15]/40 outline-none font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-[#EDE6D3] text-[#121A15]/70 rounded-md border border-[#D8D0BD]">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#121A15]/60">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (item.href) router.push(item.href);
                    if (item.action) item.action();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-[#EDE6D3]/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#121A15]/5 group-hover:bg-[#121A15] group-hover:text-white transition-colors flex items-center justify-center text-[#121A15]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#121A15]">{item.name}</p>
                      <p className="text-[10px] text-[#121A15]/50">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#B89B5E] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-medium">
                    Jump &rarr;
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-[#EDE6D3]/40 border-t border-[#D8D0BD]/60 flex items-center justify-between text-[11px] text-[#121A15]/60">
          <span>Navigate with arrows or mouse</span>
          <span className="font-mono">Ctrl + K / ⌘ + K</span>
        </div>
      </div>
    </div>
  );
}
