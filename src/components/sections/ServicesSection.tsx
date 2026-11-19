'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Flower2,
  Sparkles,
  Apple,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkle,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

interface HomeServiceItem {
  id: string;
  number: string;
  title: string;
  tag: string;
  duration: string;
  twoLineDesc: string;
  icon: React.ElementType;
  gradient: string;
}

const HOME_SERVICES: HomeServiceItem[] = [
  {
    id: 'general',
    number: '01',
    title: 'General Consultation',
    tag: 'Primary Care',
    duration: '45–60 Mins',
    twoLineDesc:
      'Comprehensive evaluation of your health history and constitution to formulate a personalized homeopathic plan.',
    icon: Stethoscope,
    gradient: 'from-emerald-500/10 via-sage/10 to-transparent',
  },
  {
    id: 'ongoing',
    number: '02',
    title: 'Ongoing Consultations',
    tag: 'Care Continuity',
    duration: '20–30 Mins',
    twoLineDesc:
      'Regular follow-up reviews to track symptom progression, adjust remedy potencies, and support long-term wellness.',
    icon: HeartPulse,
    gradient: 'from-teal-500/10 via-sage/10 to-transparent',
  },
  {
    id: 'pediatric',
    number: '03',
    title: 'Pediatric Homeopathy',
    tag: 'Gentle Care',
    duration: '30–45 Mins',
    twoLineDesc:
      'Sweet-tasting, gentle remedies tailored for infants, children, and teenagers with complete parent involvement.',
    icon: Baby,
    gradient: 'from-amber-500/10 via-gold/10 to-transparent',
  },
  {
    id: 'womens-health',
    number: '04',
    title: "Women's Health",
    tag: 'Holistic Focus',
    duration: '40–50 Mins',
    twoLineDesc:
      'Compassionate, private consultations addressing hormonal balance, reproductive wellness, and emotional harmony.',
    icon: Flower2,
    gradient: 'from-rose-500/10 via-sage/10 to-transparent',
  },
  {
    id: 'skin-hair',
    number: '05',
    title: 'Skin & Hair Care',
    tag: 'Root-Cause Care',
    duration: '35–45 Mins',
    twoLineDesc:
      'Evaluating internal constitutional triggers behind recurrent skin sensitivities and hair thinning naturally.',
    icon: Sparkles,
    gradient: 'from-purple-500/10 via-gold/10 to-transparent',
  },
  {
    id: 'digestive',
    number: '06',
    title: 'Digestive Health',
    tag: 'Metabolic Balance',
    duration: '35–45 Mins',
    twoLineDesc:
      'Holistic assessment of gut sensitivity, digestive rhythm, and lifestyle triggers to restore organic balance.',
    icon: Apple,
    gradient: 'from-lime-500/10 via-mint/20 to-transparent',
  },
];

const CARD_WIDTH = 460;
const CARD_GAP = 32;
const STEP_DISTANCE = CARD_WIDTH + CARD_GAP; // 492px

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calm, silky spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 22,
    mass: 0.6,
  });

  // Calculate startX and endX so each card centers dead-center in the user's viewport
  const startX = Math.max(20, (windowWidth - CARD_WIDTH) / 2);
  const totalOffset = (HOME_SERVICES.length - 1) * STEP_DISTANCE;
  const endX = startX - totalOffset;

  const x = useTransform(smoothProgress, [0, 1], [startX, endX]);
  const progressPercent = useTransform(smoothProgress, [0, 1], ['16.6%', '100%']);

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    const idx = Math.round(latest * (HOME_SERVICES.length - 1));
    const clamped = Math.max(0, Math.min(HOME_SERVICES.length - 1, idx));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  });

  const scrollToCard = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const startY = scrollTop + rect.top;
    const totalScroll = containerRef.current.offsetHeight - window.innerHeight;
    const targetY = startY + (index / (HOME_SERVICES.length - 1)) * totalScroll;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(HOME_SERVICES.length - 1, activeIndex + 1);
    scrollToCard(nextIdx);
  };

  return (
    <section id="treatments" className="relative bg-[#FAF9F4]">
      {/* =========================================================================
          DESKTOP / LAPTOP: 1-BY-1 ANIMATED SCROLL SHOWCASE (CLEAN 2-LINE CARDS)
          ========================================================================= */}
      <div
        ref={containerRef}
        className="relative hidden lg:block h-[460vh]"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-6 overflow-hidden bg-gradient-to-b from-[#FAF9F4] via-white to-[#FAF9F4]">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-sage/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-gold/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Section Header - Grid Aligned */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="flex items-end justify-between gap-6 pb-3 border-b border-sage/20">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-sage/30 shadow-sm mb-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-forest">
                    Consultation Options
                  </span>
                  <span className="text-xs text-gray-300">&bull;</span>
                  <span className="text-[11px] font-medium text-sage-dark">
                    Option {HOME_SERVICES[activeIndex].number} of 06
                  </span>
                </div>
                <h2 className="font-heading text-3xl xl:text-4xl font-bold text-forest tracking-tight">
                  Consultation Options
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm font-light mt-0.5">
                  Scroll down to explore pathways 1 by 1 &bull; Click card to read full clinical details
                </p>
              </div>

              {/* Step Navigation Pills & Arrow Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 border border-sage/25 backdrop-blur-md shadow-sm">
                  {HOME_SERVICES.map((srv, idx) => (
                    <button
                      key={srv.id}
                      onClick={() => scrollToCard(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        idx === activeIndex
                          ? 'bg-forest text-gold shadow-md scale-105'
                          : 'text-gray-500 hover:text-forest hover:bg-mint/60'
                      }`}
                    >
                      <span>{srv.number}</span>
                      <span className="hidden xl:inline ml-1 font-normal text-[11px] opacity-80">
                        {srv.title.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                    aria-label="Previous Option"
                    className="w-10 h-10 rounded-full border border-sage/30 bg-white text-forest hover:bg-forest hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={activeIndex === HOME_SERVICES.length - 1}
                    aria-label="Next Option"
                    className="w-10 h-10 rounded-full border border-sage/30 bg-white text-forest hover:bg-forest hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center Stage: Dead-Centered Horizontal Track with Clean 2-Line Cards */}
          <div className="relative w-full my-auto py-2 overflow-visible">
            <motion.div
              style={{ x }}
              className="flex items-stretch gap-8 w-max"
            >
              {HOME_SERVICES.map((service, idx) => {
                const Icon = service.icon;
                const isCurrent = idx === activeIndex;

                return (
                  <motion.div
                    key={service.id}
                    animate={{
                      scale: isCurrent ? 1.04 : 0.94,
                      opacity: isCurrent ? 1 : 0.55,
                      filter: isCurrent ? 'blur(0px)' : 'blur(0.5px)',
                    }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative w-[460px] rounded-[2.25rem] p-8 flex flex-col justify-between shrink-0 transition-all duration-500 overflow-hidden select-none ${
                      isCurrent
                        ? 'bg-white border-2 border-gold/70 shadow-[0_25px_60px_-15px_rgba(24,61,50,0.2)] ring-4 ring-gold/15'
                        : 'bg-white/85 border border-sage/20 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {/* Top ambient color aura */}
                    <div
                      className={`absolute top-0 right-0 left-0 h-36 bg-gradient-to-b ${service.gradient} pointer-events-none`}
                    />

                    {/* Watermark Numeral */}
                    <span className="absolute top-5 right-7 font-heading text-5xl font-bold text-sage/20 select-none pointer-events-none">
                      {service.number}
                    </span>

                    {/* Card Content Top */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isCurrent
                              ? 'bg-forest text-gold scale-105 shadow-lg shadow-forest/20'
                              : 'bg-mint text-forest'
                          }`}
                        >
                          <Icon className="w-7 h-7" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-forest/5 text-forest border border-forest/15">
                            {service.tag}
                          </span>
                          <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200">
                            <Clock className="w-3 h-3 text-gold" />
                            {service.duration}
                          </span>
                        </div>
                      </div>

                      {/* Treatment Name */}
                      <h3 className="font-heading text-2xl font-bold text-forest mb-2">
                        {service.title}
                      </h3>

                      {/* Exactly 2 Lines Info */}
                      <p className="text-gray-600 text-sm leading-relaxed font-light line-clamp-2 mb-6">
                        {service.twoLineDesc}
                      </p>
                    </div>

                    {/* Card Actions Bottom */}
                    <div className="relative z-10 pt-5 border-t border-sage/20 flex items-center justify-between gap-3">
                      <Link
                        href={`/treatments#${service.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-gold-dark transition-colors"
                      >
                        <span>Full Clinical Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/917416001477?text=${encodeURIComponent(
                            `Hello Dr. Chihnitha / VSHMA Clinic, I would like to inquire about ${service.title}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Inquire about ${service.title} on WhatsApp`}
                          className="p-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        >
                          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                        </a>

                        <Link
                          href="/book"
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-forest text-white hover:bg-forest-dark transition-all shadow-sm"
                        >
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom Bar - Grid Aligned */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-sage/20 text-xs text-gray-500">
              <div className="flex items-center gap-2 text-forest font-medium">
                <Sparkle className="w-3.5 h-3.5 text-gold" />
                <span>Scroll down to advance 1 by 1 &bull; Click pills above to jump</span>
              </div>

              {/* Progress Scrub Bar */}
              <div className="w-72 h-1.5 bg-sage/20 rounded-full overflow-hidden p-0.5">
                <motion.div
                  style={{ width: progressPercent }}
                  className="h-full bg-gradient-to-r from-forest via-sage to-gold rounded-full transition-all duration-150"
                />
              </div>

              <Link
                href="/treatments"
                className="text-xs font-semibold text-forest hover:text-gold-dark inline-flex items-center gap-1"
              >
                <span>Read Full Treatment Guide</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE / SMALL SCREENS: TOUCH-FRIENDLY SWIPER (2-LINE INFO)
          ========================================================================= */}
      <div className="block lg:hidden py-16 px-4 sm:px-6">
        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest px-3 py-1 rounded-full bg-mint">
            Consultation Pathways
          </span>
          <h2 className="font-heading text-3xl font-bold text-forest mt-2">
            Consultation Options
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 font-light">
            Tap tabs or buttons to browse our clinical consultation options.
          </p>
        </div>

        {/* Mobile Pills */}
        <div className="flex items-center justify-start gap-1.5 overflow-x-auto py-2 no-scrollbar">
          {HOME_SERVICES.map((srv, idx) => (
            <button
              key={srv.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                idx === activeIndex
                  ? 'bg-forest text-gold shadow-md'
                  : 'bg-white border border-sage/30 text-gray-700'
              }`}
            >
              {srv.number} {srv.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Active Mobile Card */}
        <motion.div
          key={HOME_SERVICES[activeIndex].id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 bg-white rounded-3xl p-6 border-2 border-gold/40 shadow-xl relative overflow-hidden"
        >
          <div
            className={`absolute top-0 right-0 left-0 h-32 bg-gradient-to-b ${HOME_SERVICES[activeIndex].gradient} pointer-events-none`}
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            {(() => {
              const Icon = HOME_SERVICES[activeIndex].icon;
              return (
                <div className="w-12 h-12 rounded-2xl bg-forest text-gold flex items-center justify-center shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
              );
            })()}
            <span className="font-heading text-4xl font-bold text-sage/20">
              {HOME_SERVICES[activeIndex].number}
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest/5 text-forest border border-forest/15">
                {HOME_SERVICES[activeIndex].tag}
              </span>
              <span className="text-[10px] font-medium text-gray-500">
                {HOME_SERVICES[activeIndex].duration}
              </span>
            </div>

            <h3 className="font-heading text-2xl font-bold text-forest mb-2">
              {HOME_SERVICES[activeIndex].title}
            </h3>

            {/* Exactly 2 Lines Info */}
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-light line-clamp-2 mb-6">
              {HOME_SERVICES[activeIndex].twoLineDesc}
            </p>

            <div className="flex items-center gap-2.5 pt-3 border-t border-sage/15">
              <Link
                href={`/treatments#${HOME_SERVICES[activeIndex].id}`}
                className="flex-1 text-center py-2.5 rounded-full text-xs font-semibold bg-forest text-white shadow-sm"
              >
                Read Full Details &rarr;
              </Link>
              <a
                href={`https://wa.me/917416001477?text=${encodeURIComponent(
                  `Hello VSHMA Clinic, I would like to inquire about ${HOME_SERVICES[activeIndex].title}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Inquire on WhatsApp"
                className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Mobile Prev / Next */}
        <div className="flex items-center justify-between mt-5 px-1">
          <button
            onClick={() => setActiveIndex((curr) => Math.max(0, curr - 1))}
            disabled={activeIndex === 0}
            className="px-4 py-2 rounded-full border border-sage/30 bg-white text-xs font-semibold text-forest disabled:opacity-40"
          >
            &larr; Previous
          </button>
          <span className="text-xs text-gray-500 font-medium">
            {activeIndex + 1} of {HOME_SERVICES.length}
          </span>
          <button
            onClick={() => setActiveIndex((curr) => Math.min(HOME_SERVICES.length - 1, curr + 1))}
            disabled={activeIndex === HOME_SERVICES.length - 1}
            className="px-4 py-2 rounded-full border border-sage/30 bg-white text-xs font-semibold text-forest disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-4 rounded-2xl bg-mint/50 border border-sage/20 flex items-center gap-3 text-xs text-gray-600 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-forest shrink-0" />
          <span>
            This website provides general information only. It is not a substitute for professional medical advice, diagnosis, or emergency hospital care.
          </span>
        </div>
      </div>
    </section>
  );
}
