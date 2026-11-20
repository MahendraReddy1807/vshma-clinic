'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Flower2,
  Sparkles,
  Apple,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

interface ConsultationOption {
  id: string;
  category: string;
  title: string;
  duration: string;
  shortDesc: string;
  details: string[];
  icon: typeof Stethoscope;
  recommendedFor: string;
}

const consultationOptions: ConsultationOption[] = [
  {
    id: 'general-consultation',
    category: 'Initial Evaluation',
    title: 'General Consultation',
    duration: '45–60 Minutes',
    shortDesc:
      'A comprehensive, in-depth evaluation of your current health concerns, medical background, emotional stress, and constitutional characteristics.',
    details: [
      'Thorough unhurried case-taking session',
      'Evaluation of physical, mental, and lifestyle factors',
      'Personalized homeopathic remedy prescription',
      'Direct lifestyle & wellness recommendations',
    ],
    icon: Stethoscope,
    recommendedFor: 'New patients or those presenting chronic, multi-system health concerns.',
  },
  {
    id: 'ongoing-consultations',
    category: 'Continued Care',
    title: 'Follow-Up Consultation',
    duration: '20–30 Minutes',
    shortDesc:
      'Periodic progress reviews to assess symptomatic changes, evaluate response to therapeutics, and adjust dosages or remedies as your vitality shifts.',
    details: [
      'Review of symptomatic relief & energy levels',
      'Potency and dosage fine-tuning',
      'Ongoing practitioner support & questions',
    ],
    icon: HeartPulse,
    recommendedFor: 'Existing patients reviewing progress 3 to 6 weeks after initial care.',
  },
  {
    id: 'pediatric-homeopathy',
    category: 'Child Health',
    title: 'Pediatric Homeopathy',
    duration: '30–45 Minutes',
    shortDesc:
      'Gentle, non-invasive consultations designed specifically for infants and children, with parent or guardian actively involved in all decisions.',
    details: [
      'Calm, friendly consultation atmosphere',
      'Easy-to-take sweet lactose globule remedies',
      'Support for seasonal immunity, digestion, and growth milestones',
    ],
    icon: Baby,
    recommendedFor: 'Infants, toddlers, and adolescents requiring gentle, natural support.',
  },
  {
    id: 'womens-health',
    category: 'Hormonal Wellness',
    title: "Women's Health Consultation",
    duration: '40–50 Minutes',
    shortDesc:
      'A private, thoughtful clinical space to discuss menstrual irregularities, hormonal transitions, postpartum wellbeing, and emotional balance.',
    details: [
      'Confidential and empathetic discussion',
      'Constitutional approach to hormonal harmony',
      'Support alongside conventional gynecological care',
    ],
    icon: Flower2,
    recommendedFor: 'Women seeking gentle holistic support for cycles, thyroid, or life stages.',
  },
  {
    id: 'skin-hair-care',
    category: 'Dermatological Focus',
    title: 'Skin & Hair Consultation',
    duration: '35–45 Minutes',
    shortDesc:
      'Investigating internal constitutional imbalances, stress triggers, and allergic tendencies that manifest as chronic dermatological or scalp issues.',
    details: [
      'Exploration of constitutional root factors',
      'Non-steroidal internal therapeutics',
      'Personalized dietary and skin hygiene guidance',
    ],
    icon: Sparkles,
    recommendedFor: 'Individuals managing persistent eczema, acne, psoriasis, or diffuse hair fall.',
  },
  {
    id: 'digestive-health',
    category: 'Metabolic & Gut',
    title: 'Digestive & Metabolic Wellness',
    duration: '35–45 Minutes',
    shortDesc:
      'Focused consultations exploring food sensitivities, gut motility, acid balance, and stress-related digestive disruptions with personalized remedies.',
    details: [
      'Assessment of digestive rhythms & appetite',
      'Identification of trigger foods & stressors',
      'Gentle stimulation of digestive vitality',
    ],
    icon: Apple,
    recommendedFor: 'Patients troubled by chronic acidity, bloating, sluggish metabolism, or IBS patterns.',
  },
];

export default function ConsultationExperiences() {
  const [activeId, setActiveId] = useState(consultationOptions[0].id);
  const activeOption = consultationOptions.find((c) => c.id === activeId) || consultationOptions[0];
  const ActiveIcon = activeOption.icon;

  return (
    <section
      id="consultations"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-ivory text-charcoal border-b border-sage/20"
      aria-label="Clinical Consultation Experiences"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-widest uppercase font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Consultation Options</span>
          </div>

          <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
            Consultations tailored to your needs.
          </h2>

          <p className="text-charcoal/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            Every appointment at VSHMA is personalized. Explore our consultation formats below and select the appropriate session for your visit.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div
          role="tablist"
          aria-label="Consultation Types"
          className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar"
        >
          {consultationOptions.map((opt) => {
            const isSelected = opt.id === activeId;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${opt.id}`}
                id={`tab-${opt.id}`}
                onClick={() => setActiveId(opt.id)}
                className={`group flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-300 font-sans cursor-pointer ${
                  isSelected
                    ? 'bg-forest text-white shadow-md ring-2 ring-forest/20'
                    : 'bg-white/80 hover:bg-white text-forest/80 hover:text-forest border border-sage/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-gold' : 'text-sage-dark'}`} />
                <span>{opt.title}</span>
              </button>
            );
          })}
        </div>

        {/* Large Featured Editorial Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOption.id}
            id={`panel-${activeOption.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeOption.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-12 rounded-[2.5rem] bg-white border border-sage/25 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
          >
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-wider uppercase font-sans">
                  {activeOption.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-charcoal/70 font-sans font-medium">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>{activeOption.duration}</span>
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-3xl sm:text-4xl text-forest font-normal leading-tight">
                  {activeOption.title}
                </h3>
                <p className="text-charcoal/80 text-base sm:text-lg leading-relaxed font-light">
                  {activeOption.shortDesc}
                </p>
              </div>

              {/* What is covered */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs uppercase font-bold tracking-wider text-gold font-sans">
                  Session Highlights:
                </p>
                <ul className="space-y-2">
                  {activeOption.details.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-charcoal/85 font-sans">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended For */}
              <div className="p-4 rounded-2xl bg-ivory border border-sage/20 text-xs text-charcoal/75 leading-relaxed font-sans">
                <strong className="font-semibold text-forest">Recommended For: </strong>
                {activeOption.recommendedFor}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href={`/book?type=${encodeURIComponent(activeOption.title)}`}
                  className="group inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-forest hover:bg-forest-light text-white font-sans font-semibold text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span>Request This Consultation</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href={`/treatments#${activeOption.id}`}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-mint/40 text-forest border border-sage/35 font-sans font-medium text-sm transition-all"
                >
                  <span>Explore Clinical Guide</span>
                </Link>

                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                    `Hello Dr. Chihnitha, I would like to inquire about ${activeOption.title} at VSHMA Clinic.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold font-sans transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>Ask Doctor</span>
                </a>
              </div>
            </div>

            {/* Right Column: Visual Feature Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-forest-dark to-forest text-white p-8 sm:p-10 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[340px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/15 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-gold border border-white/15">
                  <ActiveIcon className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold block">
                    VSHMA CLINICAL STANDARD
                  </span>
                  <h4 className="font-heading text-xl sm:text-2xl text-ivory font-semibold">
                    Comprehensive &amp; Safe Care
                  </h4>
                  <p className="text-xs sm:text-sm text-sage-light leading-relaxed font-light">
                    Every consultation follows standardized classical case-taking methodology under Dr. Chihnitha Reddy T (BHMS), respecting patient privacy and medical ethics.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-sage-light">
                <span>In-Clinic &amp; Online Options</span>
                <span className="text-gold font-semibold font-sans">Prior Booking Required</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
