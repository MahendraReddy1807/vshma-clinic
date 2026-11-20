'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Flower2,
  Sparkles,
  Apple,
  Clock,
  ArrowRight,
  CheckCircle2,
  Video,
} from 'lucide-react';

interface ConsultationItem {
  id: string;
  number: string;
  title: string;
  category: string;
  duration: string;
  format: string;
  shortDesc: string;
  highlights: string[];
  icon: typeof Stethoscope;
}

const CONSULTATIONS_DATA: ConsultationItem[] = [
  {
    id: 'general-consultation',
    number: '01',
    title: 'General Consultation',
    category: 'Initial Clinical Case-Taking',
    duration: '45 to 60 Min',
    format: 'In-Clinic & Video',
    shortDesc:
      'A thorough, unhurried assessment of your complete health story, current symptoms, lifestyle patterns, and constitutional characteristics.',
    highlights: [
      'In-depth totality symptom review',
      'Evaluation of sleep, stress & energy cycles',
      'Personalized constitutional remedy formulation',
    ],
    icon: Stethoscope,
  },
  {
    id: 'ongoing-consultations',
    number: '02',
    title: 'Ongoing Consultations',
    category: 'Progress Review & Calibration',
    duration: '20 to 30 Min',
    format: 'In-Clinic & Video',
    shortDesc:
      'Scheduled reviews to observe your clinical response, evaluate changes in symptom patterns, and adjust remedy potencies as your health progresses.',
    highlights: [
      'Assessment of symptomatic shifts & vitality',
      'Potency & dosage calibrations as needed',
      'Ongoing practitioner dialogue & guidance',
    ],
    icon: HeartPulse,
  },
  {
    id: 'pediatric-homeopathy',
    number: '03',
    title: 'Pediatric Homeopathy',
    category: 'Gentle Child Healthcare',
    duration: '30 to 45 Min',
    format: 'In-Clinic & Video',
    shortDesc:
      'Gentle, non-invasive consultations designed for infants and children using pleasant sweet globules that support natural immune vitality.',
    highlights: [
      'Support for seasonal colds, coughs & immunity',
      'Gentle care for digestive & feeding patterns',
      'Sweet, non-bitter globules that kids take easily',
    ],
    icon: Baby,
  },
  {
    id: 'womens-health',
    number: '04',
    title: "Women's Health",
    category: 'Hormonal & Life-Stage Balance',
    duration: '40 to 50 Min',
    format: 'In-Clinic & Video',
    shortDesc:
      'A thoughtful, confidential clinical setting to address menstrual rhythms, PCOS/PCOD patterns, thyroid balance, and life-stage transitions.',
    highlights: [
      'Cycle regularity & hormonal equilibrium review',
      'Constitutional care for PCOS/PCOD patterns',
      'Safe, non-hormonal homeopathic therapeutics',
    ],
    icon: Flower2,
  },
  {
    id: 'skin-hair-care',
    number: '05',
    title: 'Skin & Hair Care',
    category: 'Dermatological Medicine',
    duration: '35 to 45 Min',
    format: 'In-Clinic & Video',
    shortDesc:
      'Investigating constitutional root factors, gut-skin connections, and stress triggers that manifest as chronic dermatological or scalp concerns.',
    highlights: [
      'Root evaluation for eczema, acne & allergies',
      'Diffuse hair thinning & scalp health analysis',
      'Internal therapeutics without topical steroids',
    ],
    icon: Sparkles,
  },
  {
    id: 'digestive-health',
    number: '06',
    title: 'Digestive Health',
    category: 'Gut Motility & Metabolic Rhythm',
    duration: '35 to 45 Min',
    format: 'In-Clinic & Video',
    shortDesc:
      'A structured assessment of digestive motility, acid balance, chronic bloating, food sensitivities, and stress-related gut discomfort.',
    highlights: [
      'Acid reflux, GERD & indigestion analysis',
      'Motility rhythms & chronic bloating relief',
      'Restoration of natural self-regulating digestion',
    ],
    icon: Apple,
  },
];

export default function ConsultationOptionsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [dims, setDims] = useState({ cardWidth: 420, gap: 32, totalTravel: 2260 });

  // Calculate card sizing and total travel dynamically so active card is centered
  useEffect(() => {
    const calcDims = () => {
      const isXl = window.innerWidth >= 1280;
      const is2Xl = window.innerWidth >= 1536;
      const cardWidth = is2Xl ? 440 : isXl ? 420 : 380;
      const gap = isXl ? 32 : 24;
      const totalTravel = (CONSULTATIONS_DATA.length - 1) * (cardWidth + gap);
      setDims({ cardWidth, gap, totalTravel });
    };

    calcDims();
    window.addEventListener('resize', calcDims);
    return () => window.removeEventListener('resize', calcDims);
  }, []);

  // Vertical scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Silky buttery luxury spring glide
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 25,
    restDelta: 0.001,
  });

  // Dynamic horizontal translation:
  // Starts at 0 (Card 01 centered at 50vw) and glides to -totalTravel (Card 06 centered at 50vw)
  const x = useTransform(smoothProgress, [0, 1], [0, -dims.totalTravel]);

  // Update active card index based on scroll position
  useEffect(() => {
    return smoothProgress.on('change', (latest) => {
      const step = Math.min(
        Math.max(Math.round(latest * (CONSULTATIONS_DATA.length - 1)), 0),
        CONSULTATIONS_DATA.length - 1
      );
      setActiveStep(step);
    });
  }, [smoothProgress]);

  // Jump smoothly to center a specific card
  const scrollToStep = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + (index / (CONSULTATIONS_DATA.length - 1)) * containerHeight;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    <section
      id="consultations"
      ref={containerRef}
      className="relative scroll-mt-28 lg:h-[450vh] bg-[#F7F4EC] text-charcoal border-b border-[#D8D0BD]/40 select-none overflow-clip"
      aria-label="Clinical Consultation Options"
    >
      {/* Anchor for treatments URL */}
      <div id="treatments" className="absolute -top-28" />

      {/* ───────────── DESKTOP PINNED HORIZONTAL STAGE ───────────── */}
      <div className="hidden lg:flex sticky top-0 h-screen w-full flex-col justify-between overflow-hidden pt-24 xl:pt-28 pb-5 z-10">
        
        {/* Overhead Luxury Center Spotlight Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(185,164,119,0.18),transparent_70%)] pointer-events-none z-0" />

        {/* Ambient Floating Depth Orbs (Luxury Botanical Radiance) */}
        <motion.div
          animate={{
            x: [0, 35, 0],
            y: [0, -25, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-16 left-1/4 w-[480px] h-[480px] rounded-full bg-[#8BA895]/15 blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute -bottom-20 right-1/4 w-[540px] h-[540px] rounded-full bg-[#B9A477]/14 blur-[130px] pointer-events-none"
        />

        {/* ───────────── TOP HEADER & PROGRESS INDICATOR ───────────── */}
        <header className="relative z-20 flex items-end justify-between border-b border-[#D8D0BD]/50 pb-4 shrink-0 px-8 lg:px-14">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-forest/10 text-forest text-[11px] font-semibold tracking-widest uppercase font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-bronze animate-pulse" />
              <span>Consultation Formats</span>
            </div>
            <h2 className="font-display font-light text-2xl xl:text-3xl text-forest leading-snug">
              Consultations tailored to your personal health story.
            </h2>
          </div>

          {/* Live Progress Counter & Glide Bar */}
          <div className="flex flex-col items-end gap-2 shrink-0 pl-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-sans text-charcoal/60 uppercase tracking-widest hidden xl:inline">
                Scroll to glide through specialties
              </span>
              <div className="px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#D8D0BD] shadow-xs text-xs font-sans font-medium text-forest flex items-center gap-1.5">
                <span className="font-display text-sm text-bronze font-semibold">
                  {CONSULTATIONS_DATA[activeStep].number}
                </span>
                <span className="text-charcoal/40 font-sans text-[11px]">/ 06</span>
              </div>
            </div>

            {/* Continuous Horizontal Progress Track */}
            <div className="w-48 xl:w-56 h-1 bg-[#D8D0BD]/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-forest via-bronze to-forest rounded-full"
                style={{
                  width: `${((activeStep + 1) / CONSULTATIONS_DATA.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </header>

        {/* ───────────── HORIZONTAL CENTER-STAGE TRACK ───────────── */}
        {/* Track starts with Card 01 centered at exactly 50vw of the viewport */}
        <main className="relative z-10 my-auto py-2 overflow-visible w-full">
          <motion.div
            style={{
              x,
              paddingLeft: `calc(50vw - ${dims.cardWidth / 2}px)`,
              paddingRight: `calc(50vw - ${dims.cardWidth / 2}px)`,
            }}
            className="flex items-stretch will-change-transform gap-6 xl:gap-8"
          >
            {CONSULTATIONS_DATA.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeStep;

              // Sinusoidal floating animation wave
              // Active card oscillates gently with higher elevation and subtle micro-tilt
              const floatOffset = index % 2 === 0 ? -10 : -7;
              const floatDuration = 4.8 + (index % 3) * 0.6;

              return (
                <motion.article
                  key={item.id}
                  animate={{
                    y: isActive ? [0, floatOffset, 0] : [0, floatOffset * 0.65, 0],
                    rotate: isActive ? [0, 0.4, -0.4, 0] : 0,
                  }}
                  transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: index * 0.3,
                  }}
                  whileHover={{
                    y: -14,
                    scale: 1.03,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }}
                  style={{
                    width: dims.cardWidth,
                  }}
                  className={`h-[calc(100vh-270px)] min-h-[420px] max-h-[500px] shrink-0 flex flex-col justify-between rounded-2xl transition-all duration-500 p-6 xl:p-7 group relative cursor-default ${
                    isActive
                      ? 'bg-gradient-to-b from-white via-white to-[#FAF7F0] border-bronze shadow-[0_28px_65px_-12px_rgba(24,61,50,0.22),_0_0_40px_rgba(185,164,119,0.18)] ring-1 ring-bronze/50 scale-100 opacity-100 z-20'
                      : 'bg-white/85 backdrop-blur-md border-[#D8D0BD]/75 shadow-[0_8px_24px_-8px_rgba(41,43,39,0.06)] hover:border-bronze/60 hover:shadow-[0_22px_50px_-10px_rgba(24,61,50,0.14)] scale-[0.96] opacity-65 hover:opacity-100 z-10'
                  }`}
                >
                  {/* Luxury Gold Hairline Accent Bar on Active Card */}
                  {isActive && (
                    <motion.div
                      layoutId="cardActiveGlow"
                      className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-[#B9A477] to-transparent rounded-full"
                    />
                  )}

                  {/* Soft Background Hover Gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/60 via-transparent to-sage/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="space-y-3.5 relative z-10 overflow-hidden">
                    {/* Top Row: Number, Icon, Category */}
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl xl:text-3xl font-light text-bronze transition-transform duration-300 group-hover:translate-x-0.5">
                        {item.number}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.12, rotate: 4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-xs ${
                          isActive
                            ? 'bg-forest text-white border-forest shadow-sm ring-2 ring-bronze/20'
                            : 'bg-[#F6F2E9] border-[#D8D0BD] text-forest group-hover:bg-forest group-hover:text-white group-hover:border-forest'
                        }`}
                      >
                        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                      </motion.div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bronze font-sans block mb-0.5">
                        {item.category}
                      </span>
                      <h3 className="font-display text-xl xl:text-2xl text-forest font-normal leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Meta Pills: Duration & Format */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal/70 font-sans">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F6F2E9] border border-[#D8D0BD]/60 font-medium">
                        <Clock className="w-3 h-3 text-bronze" />
                        <span>{item.duration}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F6F2E9] border border-[#D8D0BD]/60 font-medium">
                        <Video className="w-3 h-3 text-sage" />
                        <span>{item.format}</span>
                      </span>
                    </div>

                    {/* Short Clear 1–2 Line Description */}
                    <p className="text-charcoal/80 text-xs xl:text-sm font-light leading-relaxed font-sans line-clamp-2">
                      {item.shortDesc}
                    </p>

                    {/* Key Session Highlights */}
                    <div className="pt-2.5 border-t border-[#D8D0BD]/40 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/90 font-sans block">
                        Session Highlights:
                      </span>
                      <ul className="space-y-1">
                        {item.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-start gap-1.5 text-xs text-charcoal/80 font-sans leading-relaxed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA (Pinned & Prominent) */}
                  <div className="pt-3 border-t border-[#D8D0BD]/50 relative z-10 shrink-0">
                    <Link
                      href={`/book?type=${encodeURIComponent(item.title)}`}
                      className={`group/btn inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                        isActive
                          ? 'bg-forest hover:bg-forest-light text-white ring-1 ring-forest/20'
                          : 'bg-forest/90 hover:bg-forest text-white'
                      }`}
                    >
                      <span>Book {item.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </main>

        {/* ───────────── BOTTOM CONTROL BAR ───────────── */}
        <footer className="relative z-20 flex items-center justify-between border-t border-[#D8D0BD]/50 pt-3 shrink-0 px-8 lg:px-14">
          <div className="flex items-center gap-1.5">
            {CONSULTATIONS_DATA.map((c, i) => (
              <button
                key={c.id}
                onClick={() => scrollToStep(i)}
                className={`px-3 py-1 rounded-lg text-xs font-sans transition-all duration-300 cursor-pointer ${
                  i === activeStep
                    ? 'bg-forest text-white font-semibold shadow-xs scale-105 ring-1 ring-bronze/40'
                    : 'bg-white hover:bg-white/90 text-charcoal/70 border border-[#D8D0BD] hover:border-bronze/50'
                }`}
              >
                <span>{c.number}. {c.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-charcoal/60 font-sans">
            <span>Specialty </span>
            <strong className="text-forest font-semibold">{CONSULTATIONS_DATA[activeStep].number} of 06</strong>
            <span className="hidden sm:inline"> &bull; Centered spotlight glide</span>
          </div>
        </footer>

      </div>

      {/* ───────────── MOBILE / TABLET NATIVE SWIPE ───────────── */}
      <div className="lg:hidden px-5 sm:px-8 py-20 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-widest uppercase font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-bronze" />
            <span>Consultation Options</span>
          </div>

          <h2 className="font-display font-light text-3xl sm:text-4xl text-forest leading-tight">
            Consultations tailored to your personal health story.
          </h2>

          <p className="text-charcoal/75 text-sm sm:text-base font-light leading-relaxed font-sans">
            Swipe horizontally to explore all six consultation categories. Each session is unhurried, private, and individualized.
          </p>

          <div className="flex items-center gap-2 text-xs text-bronze font-sans font-medium pt-1">
            <span>Swipe horizontally</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Native Horizontal Scroll Container with Snapping */}
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-5 px-5 no-scrollbar">
          {CONSULTATIONS_DATA.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-[84vw] max-w-[360px] shrink-0 snap-center flex flex-col justify-between rounded-2xl bg-white border border-[#D8D0BD] shadow-md p-6 sm:p-7 space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-bronze font-light">
                      {item.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#F6F2E9] border border-[#D8D0BD] flex items-center justify-center text-forest">
                      <Icon className="w-4 h-4 text-forest" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bronze font-sans block mb-0.5">
                      {item.category}
                    </span>
                    <h3 className="font-display text-2xl text-forest font-normal">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/70 font-sans">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F6F2E9] border border-[#D8D0BD]/60">
                      <Clock className="w-3 h-3 text-bronze" />
                      <span>{item.duration}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F6F2E9] border border-[#D8D0BD]/60">
                      <Video className="w-3 h-3 text-sage" />
                      <span>{item.format}</span>
                    </span>
                  </div>

                  <p className="text-charcoal/80 text-xs sm:text-sm font-light leading-relaxed font-sans">
                    {item.shortDesc}
                  </p>

                  <div className="pt-2 border-t border-[#D8D0BD]/40 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest font-sans block">
                      Highlights:
                    </span>
                    <ul className="space-y-1">
                      {item.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-1.5 text-xs text-charcoal/75 font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8D0BD]/50">
                  <Link
                    href={`/book?type=${encodeURIComponent(item.title)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest text-white text-xs font-semibold uppercase tracking-wider shadow-sm font-sans active:scale-98 transition-transform"
                  >
                    <span>Book {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Mobile Indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {CONSULTATIONS_DATA.map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#D8D0BD]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
