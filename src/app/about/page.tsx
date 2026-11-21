import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import {
  GraduationCap,
  MapPin,
  Clock,
  Heart,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: `About ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) | VSHMA Homeopathy Clinic`,
  description: `Learn about Dr. Chihnitha Reddy T (BHMS), lead practitioner at VSHMA Homeopathy Clinic in Bengaluru. Discover her patient-first philosophy and clinical approach.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-36">
        {/* Editorial Hero Header */}
        <section className="relative py-12 sm:py-16 bg-forest text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-ivory text-xs font-semibold uppercase tracking-widest font-sans border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Practitioner Profile</span>
              </div>
              <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-7xl text-ivory leading-[1.05] tracking-tight">
                {CLINIC_INFO.doctor}
              </h1>
              <p className="text-sage-light text-lg sm:text-xl font-light font-sans">
                {CLINIC_INFO.qualificationFull} ({CLINIC_INFO.qualification}) &bull; Bengaluru, India
              </p>
            </div>
          </div>
        </section>

        {/* Doctor Story & Portrait Section */}
        <section className="py-20 lg:py-28 bg-white border-b border-sage/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Portrait & Key Details */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative rounded-[2rem] overflow-hidden bg-forest border border-brass/40 shadow-xl aspect-[3/4] max-w-md mx-auto lg:max-w-none">
                  <Image
                    src="/images/dr-chihnitha.jpg"
                    alt={`Portrait of ${CLINIC_INFO.doctor}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 450px"
                    className="object-cover object-center"
                  />
                </div>

                {/* Identity Plaque Positioned Cleanly Below Image */}
                <div className="p-4 rounded-2xl bg-forest text-bone border border-brass/30 shadow-md flex items-center justify-between max-w-md mx-auto lg:max-w-none">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brass block font-sans">
                      Lead Practitioner &bull; Bengaluru
                    </span>
                    <p className="font-serif font-light text-xl text-bone">
                      {CLINIC_INFO.doctor}
                    </p>
                    <p className="text-xs text-sage/80 font-sans mt-0.5">
                      {CLINIC_INFO.qualification} &bull; Classical Homeopathy
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-forest-light/60 border border-brass/40 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-brass" />
                  </div>
                </div>

                {/* Quick Info Box */}
                <div className="p-5 rounded-2xl bg-ivory border border-sage/25 space-y-3 max-w-md mx-auto lg:max-w-none">
                  <div className="flex items-center gap-3 text-sm text-charcoal/80 font-sans">
                    <GraduationCap className="w-4 h-4 text-forest shrink-0" />
                    <span><strong>Degree:</strong> {CLINIC_INFO.qualification}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-charcoal/80 font-sans">
                    <MapPin className="w-4 h-4 text-forest shrink-0" />
                    <span><strong>Location:</strong> {CLINIC_INFO.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-charcoal/80 font-sans">
                    <Clock className="w-4 h-4 text-forest shrink-0" />
                    <span><strong>Format:</strong> Prior appointment only (In-clinic &amp; Online)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: In-depth Biography & Practice Philosophy */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold block font-sans">
                    Clinical Philosophy
                  </span>
                  <h2 className="font-display font-light text-3xl sm:text-5xl text-forest leading-tight">
                    &ldquo;Healing begins when a patient feels completely heard.&rdquo;
                  </h2>
                </div>

                <div className="space-y-5 text-charcoal/85 text-base sm:text-lg leading-relaxed font-sans font-light">
                  <p>
                    Dr. Chihnitha Reddy T completed her Bachelor of Homeopathic Medicine and Surgery (BHMS) with a focus on classical constitutional case-taking. Believing that each individual possesses a distinct physiological and psychological constitution, her practice centers on finding remedies that mirror the totality of each person&apos;s symptoms.
                  </p>
                  <p>
                    In an era where healthcare appointments are increasingly compressed into a few minutes, Dr. Chihnitha founded VSHMA Homeopathy Clinic to protect the sacred art of unhurried clinical dialogue. She takes the time to investigate past medical history, family patterns, thermal preferences, sleep cycles, and mental-emotional stress.
                  </p>
                  <p>
                    Her clinical approach is gentle, ethical, and collaborative. She actively encourages patients to maintain open communication with their allopathic specialists when managing complex chronic conditions, ensuring a responsible, integrated approach to wellbeing.
                  </p>
                </div>

                {/* Core Principles */}
                <div className="space-y-4 pt-4 border-t border-sage/20">
                  <h3 className="font-heading font-semibold text-forest text-xl">
                    Her Principles of Practice
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-ivory border border-sage/20 space-y-2">
                      <div className="flex items-center gap-2 text-forest font-semibold text-sm">
                        <Heart className="w-4 h-4 text-gold" />
                        <span>Attentive Listening</span>
                      </div>
                      <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                        Never rushed. Every consultation provides space to share what matters most to you.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-ivory border border-sage/20 space-y-2">
                      <div className="flex items-center gap-2 text-forest font-semibold text-sm">
                        <ShieldCheck className="w-4 h-4 text-gold" />
                        <span>Medical Transparency</span>
                      </div>
                      <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                        Clear clinical reasoning, realistic timelines, and no false or exaggerated promises.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/book"
                    className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-forest hover:bg-forest-light text-white font-sans font-semibold text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <span>Request a Consultation with Dr. Chihnitha</span>
                    <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  <a
                    href={CLINIC_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-sans font-medium text-sm transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
