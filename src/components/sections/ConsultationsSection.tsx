'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import SectionTag from '@/components/ui/luxury/SectionTag';
import AccordionRow from '@/components/ui/luxury/AccordionRow';
import SplitSemis from '@/components/ui/luxury/SplitSemis';
import PillButton from '@/components/ui/luxury/PillButton';
import { SITE_CONFIG } from '@/lib/site-config';

export default function ConsultationsSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const { consultations } = SITE_CONFIG;

  return (
    <section
      id="consultations"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-[#0A0F0C] text-[#F7F3EC] overflow-hidden"
      aria-label="Clinical Consultation Specialties"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#D4D8BA]/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-48 w-96 h-96 rounded-full bg-[#B89B5E]/8 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 sm:mb-20">
          <SectionTag variant="dark">
            Consultation Formats &bull; Specialties
          </SectionTag>

          <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-[#F7F3EC] leading-[1.08] tracking-tight">
            Consultations tailored to your personal health story.
          </h2>

          <p className="text-[#D8D0BD]/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            Every consultation is private, unhurried, and constitutional. Select an area below to explore session formats and clinical focus.
          </p>
        </div>

        {/* Two-Column Grid: SplitSemis Visual on Left, Accordion on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: SplitSemis Botanical Visual & Quick Booking Trigger */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 hidden md:block">
            <SplitSemis
              src="/images/hero-homeo.jpg"
              alt="Natural botanical remedies and individualized homeopathy at VSHMA Clinic"
              aspect="aspect-[4/5]"
              badgeContent={
                <div className="p-4 rounded-2xl bg-[#121A15]/90 backdrop-blur-md border border-white/15 text-[#F7F3EC] shadow-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B89B5E] block font-sans">
                    Session Structure
                  </span>
                  <p className="font-display font-normal text-lg sm:text-xl text-[#F7F3EC]">
                    45–60 min initial &bull; 20–30 min review
                  </p>
                </div>
              }
            />

            <div className="text-center sm:text-left space-y-3">
              <p className="text-xs text-[#D8D0BD]/70 font-sans leading-relaxed">
                Available in-clinic at our private Bengaluru practice or via secure virtual video for out-of-station patients.
              </p>
              <PillButton
                variant="brass"
                size="md"
                href="/book"
                icon={<ArrowUpRight className="w-4 h-4 text-[#121A15]" />}
              >
                Request a Consultation Slot
              </PillButton>
            </div>
          </div>

          {/* Right Column: Unified 6-Item Accordion List */}
          <div className="lg:col-span-7 rounded-[24px] border border-white/10 bg-[#121A15]/60 backdrop-blur-md overflow-hidden shadow-2xl">
            {consultations.map((item, index) => (
              <AccordionRow
                key={item.id}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
