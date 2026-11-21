'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Leaf, HeartHandshake, ShieldCheck, ArrowUpRight } from 'lucide-react';
import SectionTag from '@/components/ui/luxury/SectionTag';
import SageCard from '@/components/ui/luxury/SageCard';
import GlyphIcon from '@/components/ui/luxury/GlyphIcon';
import PillButton from '@/components/ui/luxury/PillButton';

const approachCards = [
  {
    number: '01',
    glyph: 'crescent' as const,
    title: 'Totality Case Taking',
    subtitle: 'Deep Listening',
    tag: 'Constitutional Totality',
    description:
      'We dedicate 45 to 60 minutes during your first session to understand physical symptoms alongside lifestyle rhythms, sleep, and emotional stressors.',
    icon: Eye,
  },
  {
    number: '02',
    glyph: 'half-leaf' as const,
    title: 'Individualized Therapeutics',
    subtitle: 'Custom Matching',
    tag: 'Custom Formulation',
    description:
      'In classical homeopathy, no two patients receive the exact same prescription for the same complaint. Remedies are selected for your unique constitution.',
    icon: Leaf,
  },
  {
    number: '03',
    glyph: 'semi-stacked' as const,
    title: 'Longitudinal Review',
    subtitle: 'Ongoing Guidance',
    tag: 'Progress Evaluation',
    description:
      'Care continues beyond your first visit. Periodic reviews evaluate shifts in your wellbeing and fine-tune your regimen as your vitality responds.',
    icon: HeartHandshake,
  },
  {
    number: '04',
    glyph: 'orbital-cross' as const,
    title: 'Ethical Clinical Boundaries',
    subtitle: 'Responsible Care',
    tag: 'Clinical Transparency',
    description:
      'We practice with complete transparency. We never claim miracles or discourage conventional medical care when necessary for patient safety.',
    icon: ShieldCheck,
  },
];

export default function OurApproachSection() {
  return (
    <section
      id="our-approach"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-[#F7F3EC] text-[#161815] overflow-hidden border-b border-[#D8D0BD]/50"
      aria-label="Our Clinical Approach"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Narrative Statement */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
            <SectionTag variant="light">
              Clinical Approach &bull; Methodology
            </SectionTag>

            <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-[#121A15] leading-[1.08] tracking-tight">
              Care rooted in personal dialogue and constitutional rigour.
            </h2>

            <p className="text-[#161815]/75 text-base sm:text-lg font-light leading-relaxed font-sans">
              We look at the whole person, not just the isolated symptom. By examining lifestyle rhythms, environmental sensitivities, and emotional stresses, we formulate natural remedies tailored specifically to you.
            </p>

            <div className="pt-2">
              <PillButton
                variant="outline"
                size="md"
                href="/book"
                icon={<ArrowUpRight className="w-4 h-4 text-[#B89B5E]" />}
              >
                Experience This Care
              </PillButton>
            </div>
          </div>

          {/* Right Column: 2x2 Sage Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {approachCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <SageCard
                  key={card.number}
                  variant={idx % 2 === 0 ? 'sage' : 'bone'}
                  className="flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Card Header: Number & Glyphs */}
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-light text-[#987E45]">
                        {card.number}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-white/40 border border-[#161815]/10 flex items-center justify-center text-[#121A15]">
                        <GlyphIcon name={card.glyph} size={16} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#987E45] block">
                        {card.subtitle}
                      </span>
                      <h3 className="font-display font-normal text-2xl text-[#121A15] leading-tight">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#161815]/75 leading-relaxed font-sans font-light">
                      {card.description}
                    </p>
                  </div>

                  {/* Distinct Tag per Card */}
                  <div className="pt-4 border-t border-[#161815]/10 flex items-center justify-between text-[11px] font-sans font-semibold tracking-wider uppercase text-[#121A15]/80">
                    <span>{card.tag}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B89B5E]" />
                  </div>
                </SageCard>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
