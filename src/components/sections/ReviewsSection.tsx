'use client';

import { MessageCircle, Quote } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { CLINIC_INFO } from '@/lib/constants';

const feedbackUrl = `${CLINIC_INFO.whatsappUrl}?text=${encodeURIComponent('Hello VSHMA, I would like to share feedback about my experience.')}`;

export default function ReviewsSection() {
  const reviewPlaceholders = [1, 2, 3];

  return (
    <section className="relative overflow-hidden bg-forest py-20 text-white sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-40 h-[34rem] w-[34rem] rounded-full bg-sage/15 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading align="left" title="Patient voices" subtitle="A place for approved feedback from VSHMA patients." light className="mb-8 max-w-2xl" />
        <div className="mb-5 rounded-xl border border-[#d8c498]/35 bg-white/[.07] px-4 py-3 text-xs leading-5 text-white/75">
          Review placeholders — replace every card with a real, approved patient review before publishing.
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviewPlaceholders.map((item) => (
            <article key={item} className="flex min-h-56 flex-col rounded-2xl border border-white/15 bg-white/[.07] p-6 backdrop-blur-sm sm:p-7">
              <Quote className="h-6 w-6 text-[#d8c498]" />
              <p className="mt-5 font-heading text-xl leading-snug text-white">Add approved patient review text here.</p>
              <div className="mt-auto border-t border-white/15 pt-4">
                <p className="text-sm font-medium text-white/85">Patient name or initials</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/55">Use only with consent</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/15 bg-[#214b3d] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-sm leading-6 text-white/70">Feedback should reflect a patient’s own experience and must not imply a guaranteed medical outcome.</p>
          <a href={feedbackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#d8c498] px-5 py-3 text-sm font-semibold text-forest transition-transform hover:-translate-y-0.5">
            <MessageCircle className="h-4 w-4" /> Share feedback on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
