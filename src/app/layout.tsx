import type { Metadata, Viewport } from 'next';
import { Newsreader, Instrument_Sans } from 'next/font/google';
import './globals.css';
import { CLINIC_INFO } from '@/lib/constants';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500'],
  variable: '--font-newsreader',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#121A15',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vshma.in'),
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
    <html lang="en" className={`h-full antialiased ${newsreader.variable} ${instrumentSans.variable}`}>
      <head>
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="32x32 48x48 192x192 512x512" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F7F3EC] text-[#161815] selection:bg-[#D4D8BA]/40 selection:text-[#121A15]">
        {/* Structured Data: MedicalClinic & Physician Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'MedicalClinic',
                  '@id': 'https://vshma.in/#clinic',
                  name: 'VSHMA Homeopathy Clinic',
                  legalName: 'VSHMA Homeopathy Clinic',
                  url: 'https://vshma.in',
                  telephone: '+917416001477',
                  email: 'care@vshma.in',
                  medicalSpecialty: 'Homeopathic',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Bengaluru',
                    addressRegion: 'Karnataka',
                    addressCountry: 'IN',
                  },
                  openingHoursSpecification: [
                    {
                      '@type': 'OpeningHoursSpecification',
                      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                      opens: '09:00',
                      closes: '19:00',
                    },
                  ],
                },
                {
                  '@type': 'Physician',
                  '@id': 'https://vshma.in/#doctor',
                  name: 'Dr. Chihnitha Reddy T',
                  jobTitle: 'Lead Homeopathic Practitioner & Founder',
                  medicalSpecialty: 'Homeopathic',
                  worksFor: {
                    '@id': 'https://vshma.in/#clinic',
                  },
                  alumniOf: {
                    '@type': 'EducationalOrganization',
                    name: 'Bachelor of Homeopathic Medicine and Surgery (BHMS)',
                  },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
