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
    title: 'Comprehensive Intake',
    subtitle: 'Deep Listening',
    tag: 'Personal Health Story',
    description:
      'We dedicate 45 to 60 minutes during your first session to understand physical complaints alongside lifestyle rhythms, sleep, and emotional stressors.',
    icon: Eye,
  },
  {
    number: '02',
    glyph: 'half-leaf' as const,
    title: 'Tailored Formulations',
    subtitle: 'Constitutional Matching',
    tag: 'Custom Formulation',
    description:
      'In classical homeopathy, remedies are matched precisely to your constitutional characteristics and natural vitality response.',
    icon: Leaf,
  },
  {
    number: '03',
    glyph: 'semi-stacked' as const,
    title: 'Longitudinal Review',
    subtitle: 'Ongoing Guidance',
    tag: 'Progress Evaluation',
    description:
      'Care continues beyond your first visit with structured follow-ups to evaluate remedy shifts and fine-tune your prescription regimen.',
    icon: HeartHandshake,
  },
  {
    number: '04',
    glyph: 'orbital-cross' as const,
    title: 'Ethical Clinical Standards',
    subtitle: 'Responsible Care',
    tag: 'Clinical Transparency',
    description:
      'We practice with strict ethical boundaries, never claiming instant cures or discouraging primary conventional medical care when appropriate.',
    icon: ShieldCheck,
  },
];

export default function OurApproachSection() {
  return (
    <section
      id="approach"
      data-nav-theme="light"
      data-snap-section
      className="relative scroll-mt-[var(--nav-h)] min-h-[calc(100svh-var(--nav-h))] lg:h-[calc(100svh-var(--nav-h))] flex flex-col justify-center py-6 lg:py-8 bg-[#F7F3EC] text-[#161815] overflow-hidden border-b border-[#D8D0BD]/50"
      aria-label="Our Clinical Approach"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Narrative Statement */}
          <div className="lg:col-span-5 space-y-4 lg:space-y-5">
            <SectionTag variant="light">
              Philosophy &bull; Methodology
            </SectionTag>

            <h2 className="font-display font-light text-chapter-title text-[#121A15] leading-[1.05] tracking-tight">
              Care starts with listening.
            </h2>

            <p className="text-[#161815]/75 text-sm sm:text-base font-light leading-relaxed font-sans max-w-md">
              We look at the whole person rather than isolated symptoms. By understanding lifestyle rhythms and environmental stresses, we formulate natural remedies tailored specifically to you.
            </p>

            <div className="pt-1">
              <PillButton
                variant="outline"
                size="md"
                href="/book"
                className="in-page-book-btn"
                icon={<ArrowUpRight className="w-4 h-4 text-[#B89B5E]" />}
              >
                Experience This Care
              </PillButton>
            </div>
          </div>

          {/* Right Column: 2x2 Sage Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {approachCards.map((card, idx) => (
              <SageCard
                key={card.number}
                variant={idx % 2 === 0 ? 'sage' : 'bone'}
                className="flex flex-col justify-between p-5 lg:p-6 max-h-card-desktop shadow-sm"
              >
                <div className="space-y-3">
                  {/* Card Header: Number & Glyphs */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-light text-[#987E45]">
                      {card.number}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/40 border border-[#161815]/10 flex items-center justify-center text-[#121A15]">
                      <GlyphIcon name={card.glyph} size={15} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-[#987E45] block">
                      {card.subtitle}
                    </span>
                    <h3 className="font-display font-normal text-xl lg:text-2xl text-[#121A15] leading-tight">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#161815]/75 leading-relaxed font-sans font-light line-clamp-3">
                    {card.description}
                  </p>
                </div>

                {/* Distinct Tag per Card */}
                <div className="pt-3 border-t border-[#161815]/10 flex items-center justify-between text-[10px] font-sans font-semibold tracking-wider uppercase text-[#121A15]/80">
                  <span>{card.tag}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89B5E]" />
                </div>
              </SageCard>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
