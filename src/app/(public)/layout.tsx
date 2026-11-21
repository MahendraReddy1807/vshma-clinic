import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import FloatingDock from '@/components/layout/FloatingDock';
import VshmaCareAssistant from '@/components/chat/VshmaCareAssistant';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F3EC] text-[#161815] selection:bg-[#D4D8BA]/40 selection:text-[#121A15]">
      {/* ───────────── PUBLIC NAVIGATION (Fixed Header with --nav-h measurement) ───────────── */}
      <Navbar />

      {/* ───────────── PUBLIC PAGE CONTENT (With native smooth scrolling) ───────────── */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* ───────────── PUBLIC FOOTER ───────────── */}
      <Footer />
      <ScrollToTop />

      {/* ───────────── UNIFIED ACCESSIBLE CARE DOCK & ASSISTANT ───────────── */}
      <FloatingDock />
      <VshmaCareAssistant />
    </div>
  );
}
