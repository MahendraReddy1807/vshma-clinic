import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ContactSection from '@/components/sections/ContactSection';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact VSHMA Homeopathy Clinic in Bengaluru or send an appointment inquiry by WhatsApp.',
};

export default function ContactPage() {
  return <div className="min-h-screen flex flex-col bg-white"><Navbar /><main className="flex-1 pt-16"><ContactSection /></main><Footer /><FloatingWhatsApp /></div>;
}
