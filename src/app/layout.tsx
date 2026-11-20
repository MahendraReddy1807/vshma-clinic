import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CLINIC_INFO } from '@/lib/constants';
import MotionProvider from '@/components/layout/MotionProvider';
import VshmaCareAssistant from '@/components/chat/VshmaCareAssistant';

export const viewport: Viewport = {
  themeColor: '#183D32',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: `${CLINIC_INFO.fullName} | ${CLINIC_INFO.tagline}`,
    template: `%s | ${CLINIC_INFO.fullName}`,
  },
  description: `${CLINIC_INFO.fullName} in Bengaluru with ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}). Learn about the clinic and request a consultation.`,
  keywords: [
    'VSHMA Homeopathy Clinic',
    'Homeopathy Clinic in Bengaluru',
    'Dr. Chihnitha Reddy T',
    'BHMS Homeopathy Doctor Bengaluru',
    'Homeopathy Consultation Bengaluru',
    'Natural Healthcare Bengaluru',
  ],
  authors: [{ name: CLINIC_INFO.doctor }],
  creator: CLINIC_INFO.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://vshma.in',
    title: `${CLINIC_INFO.fullName} | ${CLINIC_INFO.tagline}`,
    description: `Learn about ${CLINIC_INFO.fullName} and request a consultation with ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) in Bengaluru.`,
    siteName: CLINIC_INFO.fullName,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CLINIC_INFO.fullName} | ${CLINIC_INFO.tagline}`,
    description: `Request a consultation with ${CLINIC_INFO.doctor} at ${CLINIC_INFO.fullName} in Bengaluru.`,
  },
  icons: {
    icon: [
      { url: '/icon.png?v=2', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="32x32 48x48 192x192 512x512" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F6F2E9] text-[#292B27] selection:bg-sage/20 selection:text-forest">
        <MotionProvider>
          {children}
          <VshmaCareAssistant />
        </MotionProvider>
      </body>
    </html>
  );
}
