'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import PillButton from './PillButton';
import GlyphIcon from './GlyphIcon';
import type { ConsultationTypeConfig } from '@/lib/site-config';

export interface AccordionRowProps {
  item: ConsultationTypeConfig;
  isOpen: boolean;
  onToggle: () => void;
  onSelectBooking?: (typeId: string) => void;
}

export default function AccordionRow({
  item,
  isOpen,
  onToggle,
  onSelectBooking,
}: AccordionRowProps) {
  return (
    <div
      className={`border-b transition-colors duration-300 ${
        isOpen ? 'border-[#D4D8BA]/40 bg-white/[0.03]' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full py-6 sm:py-8 px-4 sm:px-6 flex items-start sm:items-center justify-between text-left group gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1">
          {/* Index Number */}
          <span className="font-display font-light text-xl sm:text-2xl text-[#B89B5E] shrink-0 w-8">
            {item.number}
          </span>

          {/* Glyph Accent */}
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4D8BA] shrink-0 hidden sm:flex">
            <GlyphIcon name={item.glyph} size={15} />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display font-normal text-xl sm:text-2xl lg:text-3xl text-[#F7F3EC] group-hover:text-[#D4D8BA] transition-colors">
                {item.title}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-[#D8D0BD] border border-white/10">
                {item.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#D8D0BD]/70 font-sans font-light">
              {item.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Duration badges & Toggle indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#D8D0BD]/75 font-sans">
            <Clock className="w-3.5 h-3.5 text-[#B89B5E]" />
            <span>{item.durationInitial}</span>
          </div>

          <div
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? 'bg-[#B89B5E] text-[#121A15] border-[#B89B5E]'
                : 'bg-white/5 border-white/15 text-[#F7F3EC] group-hover:border-[#D4D8BA]'
            }`}
          >
            {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expandable Content Area */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-8 pt-2 pl-12 sm:pl-20 space-y-6">
              <p className="text-[#F7F3EC]/85 text-sm sm:text-base leading-relaxed font-sans font-light max-w-2xl">
                {item.description}
              </p>

              {/* Clinical Focus Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {item.focusAreas.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 text-xs text-[#D8D0BD]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B89B5E] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                <div className="text-xs text-[#D8D0BD]/70 font-sans">
                  <span>Initial: <strong>{item.durationInitial}</strong> &bull; Follow-Up: <strong>{item.durationReview}</strong></span>
                </div>

                <PillButton
                  variant="brass"
                  size="sm"
                  href={`/book?type=${encodeURIComponent(item.title)}`}
                  icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  onClick={() => onSelectBooking?.(item.id)}
                >
                  Reserve Consultation
                </PillButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
