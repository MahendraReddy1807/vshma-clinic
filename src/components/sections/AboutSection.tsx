'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, GraduationCap, MessageCircle } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { CLINIC_INFO } from '@/lib/constants';

export default function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-28 overflow-hidden bg-[#FAF9F4] py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-20 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(139,168,149,.2),transparent_68%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          align="left"
          className="mb-10 max-w-3xl sm:mb-14"
          title="A little more about your doctor"
          subtitle="Meet Dr. Chihnitha Reddy T and learn how to connect with VSHMA in Bengaluru."
        />

        <div className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: .2 }}
            transition={{ duration: .65, ease: [0.2, 0.8, 0.2, 1] }}
            className="mx-auto w-full max-w-[380px] lg:mx-0"
          >
            <div className="group relative rounded-[2rem] bg-white p-2.5 shadow-[0_28px_80px_-42px_rgba(24,61,50,.5)] ring-1 ring-forest/5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] bg-[#e8eee8]">
                <Image
                  src="/images/dr-chihnitha.jpg"
                  alt={`Portrait of ${CLINIC_INFO.doctor}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 380px"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102a23]/75 via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/55 bg-white/85 p-4 shadow-lg backdrop-blur-xl sm:inset-x-6 sm:bottom-6">
                  <p className="font-heading text-lg font-semibold text-forest sm:text-xl">{CLINIC_INFO.doctor}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#927d50]">{CLINIC_INFO.qualification}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-forest/65"><MapPin className="h-3.5 w-3.5" />{CLINIC_INFO.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: .2 }}
            transition={{ duration: .65, delay: .08, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#927d50]">VSHMA · Bengaluru</p>
            <h3 className="mt-4 max-w-2xl font-heading text-3xl font-medium leading-[1.12] tracking-[-.035em] text-forest sm:text-4xl lg:text-[3.25rem]">
              Natural care, with personal attention.
            </h3>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#53635a] sm:text-lg">
              {CLINIC_INFO.fullName} is led by {CLINIC_INFO.doctor} ({CLINIC_INFO.qualification}) in {CLINIC_INFO.location}. Contact the clinic to ask about appointment availability and consultation arrangements.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-forest/10 bg-white/80 px-5 py-4 shadow-[0_8px_28px_-22px_rgba(24,61,50,.4)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f1eb] text-forest"><GraduationCap className="h-5 w-5" /></span>
                <span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-[#927d50]">Qualification</span><span className="mt-1 block text-sm font-medium text-forest">{CLINIC_INFO.qualification}</span></span>
              </div>
              <div className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-forest/10 bg-white/80 px-5 py-4 shadow-[0_8px_28px_-22px_rgba(24,61,50,.4)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f1eb] text-forest"><MapPin className="h-5 w-5" /></span>
                <span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-[#927d50]">Location</span><span className="mt-1 block text-sm font-medium text-forest">{CLINIC_INFO.location}</span></span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/book">
                <Button size="lg" className="group min-h-12 rounded-full px-6 shadow-lg">
                  Book a consultation <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href={CLINIC_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-forest transition-colors hover:bg-mint/70">
                <MessageCircle className="h-4 w-4 text-[#238c57]" /> Ask on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
