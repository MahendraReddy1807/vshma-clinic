import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CLINIC_INFO } from '@/lib/constants';
import MotionProvider from '@/components/layout/MotionProvider';

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
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900 selection:bg-mint selection:text-forest">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
