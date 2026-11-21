'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '@/components/ui/luxury/SectionTag';
import AccordionRow from '@/components/ui/luxury/AccordionRow';
import SplitSemis from '@/components/ui/luxury/SplitSemis';
import PillButton from '@/components/ui/luxury/PillButton';
import GlyphIcon from '@/components/ui/luxury/GlyphIcon';
import { SITE_CONFIG } from '@/lib/site-config';
import { useCapability } from '@/lib/useCapability';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ConsultationsSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const { consultations } = SITE_CONFIG;
  const { isTouch, prefersReducedMotion, tier } = useCapability();

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable GSAP horizontal pin-scroll on desktop workstations with high/mid capability
    if (isTouch || prefersReducedMotion || tier === 'low') return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Calculate total horizontal scroll width
    const totalScroll = track.scrollWidth - window.innerWidth + 120;
    if (totalScroll <= 0) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${totalScroll * 1.2}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [isTouch, prefersReducedMotion, tier]);

  return (
    <section
      id="consultations"
      className="relative scroll-mt-24 bg-[#0A0F0C] text-[#F7F3EC] overflow-hidden"
      aria-label="Clinical Consultation Specialties"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#D4D8BA]/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-48 w-96 h-96 rounded-full bg-[#B89B5E]/8 blur-[160px] pointer-events-none" />

      {/* ───────────── DESKTOP PINNED HORIZONTAL CAROUSEL (Large Screens) ───────────── */}
      <div ref={containerRef} className="hidden lg:block min-h-screen py-20 px-8 relative z-10">
        <div className="max-w-7xl mx-auto mb-10 flex items-end justify-between">
          <div className="max-w-2xl space-y-4">
            <SectionTag variant="dark">Consultation Specialties &bull; Formats</SectionTag>
            <h2 className="font-serif font-light text-5xl lg:text-6xl text-[#F7F3EC] leading-[1.08] tracking-tight">
              Consultations tailored to your personal health story.
            </h2>
            <p className="text-[#D8D0BD]/75 text-base font-light font-sans">
              Scroll to explore the 6 consultation formats. Each session is unhurried, private, and constitutional.
            </p>
          </div>
          <div className="pb-2">
            <PillButton variant="brass" href="/book" icon={<ArrowUpRight className="w-4 h-4 text-[#121A15]" />}>
              Request a Slot
            </PillButton>
          </div>
        </div>

        {/* Horizontal Track of 6 Luxury Cards */}
        <div className="overflow-visible pt-4">
          <div ref={trackRef} className="flex gap-8 w-max pb-8 will-change-transform">
            {consultations.map((item) => (
              <div
                key={item.id}
                className="w-[420px] rounded-[24px] border border-white/15 bg-[#121A15]/80 backdrop-blur-md p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-[#B89B5E]/50 group"
              >
                <div className="space-y-6">
                  {/* Card Header with Glyph and Number */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="font-serif text-3xl font-light text-[#B89B5E]">{item.number}</span>
                    <GlyphIcon name={item.glyph} size={24} className="text-[#D4D8BA]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B89B5E] block font-sans">
                      {item.category}
                    </span>
                    <h3 className="font-serif font-normal text-2xl text-[#FAF8F2] group-hover:text-[#B89B5E] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#D4D8BA]/70 font-sans italic">{item.subtitle}</p>
                  </div>

                  <p className="text-sm text-[#FAF8F2]/75 leading-relaxed font-sans font-light">
                    {item.description}
                  </p>

                  {/* Focus Areas */}
                  <div className="pt-2 space-y-1.5">
                    {item.focusAreas.map((focus, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-[#D8D0BD]/70 font-sans">
                        <span className="w-1 h-1 rounded-full bg-[#B89B5E]" />
                        <span>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#B89B5E]">{item.durationInitial} initial</span>
                  <PillButton variant="outline" size="sm" href={`/book?type=${encodeURIComponent(item.title)}`}>
                    Reserve
                  </PillButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────── MOBILE & TABLET STACK (Clean Vertical Accordion) ───────────── */}
      <div className="lg:hidden py-20 px-5 sm:px-8 relative z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <SectionTag variant="dark">Consultation Specialties &bull; Formats</SectionTag>
          <h2 className="font-serif font-light text-4xl sm:text-5xl text-[#F7F3EC] leading-[1.08] tracking-tight">
            Consultations tailored to your personal health story.
          </h2>
          <p className="text-[#D8D0BD]/75 text-base font-light leading-relaxed font-sans">
            Every consultation is private, unhurried, and constitutional. Select an area below to explore session formats.
          </p>
        </div>

        {/* SplitSemis Visual for Mobile */}
        <div className="mb-10">
          <SplitSemis
            src="/images/hero-homeo.jpg"
            alt="Natural botanical remedies at VSHMA Clinic"
            aspect="aspect-[4/5]"
            badgeContent={
              <div className="p-3.5 rounded-2xl bg-[#121A15]/95 backdrop-blur-md border border-white/15 text-[#F7F3EC] shadow-xl">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B89B5E] block font-sans">
                  Session Structure
                </span>
                <p className="font-serif text-base text-[#F7F3EC]">45–60 min initial &bull; 20–30 min review</p>
              </div>
            }
          />
        </div>

        {/* 6 Accordion Rows */}
        <div className="rounded-[24px] border border-white/10 bg-[#121A15]/60 backdrop-blur-md overflow-hidden shadow-2xl mb-8">
          {consultations.map((item, index) => (
            <AccordionRow
              key={item.id}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        <div className="text-center">
          <PillButton variant="brass" href="/book" icon={<ArrowUpRight className="w-4 h-4 text-[#121A15]" />}>
            Request a Consultation Slot
          </PillButton>
        </div>
      </div>
    </section>
  );
}
