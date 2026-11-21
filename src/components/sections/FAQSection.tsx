'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

const FAQS = [
  {
    question: 'How do I request and confirm an appointment?',
    answer:
      'Submit the booking form on this website with your preferred date and time window. An instant official booking reference is generated, and a pre-filled WhatsApp conversation opens to Dr. Chihnitha’s clinic line for personal confirmation.',
  },
  {
    question: 'Can homeopathic care replace my prescribed conventional medication?',
    answer:
      'No. You should never stop, delay, or adjust prescribed conventional medical treatment without consulting your treating physician. At VSHMA, we practice ethical and transparent complementary homeopathy that safely integrates alongside ongoing medical care.',
  },
  {
    question: 'Are both in-person and online consultations available?',
    answer:
      'Yes. Dr. Chihnitha offers in-person clinical consultations in Bengaluru as well as dedicated online video consultations for patients who live outside Bengaluru or prefer remote follow-ups.',
  },
  {
    question: 'What happens during my initial consultation?',
    answer:
      'The first session is unhurried, typically lasting 45 to 60 minutes. Dr. Chihnitha evaluates your complete health profile, lifestyle rhythms, emotional stress triggers, past medical history, and specific symptoms before preparing an individualized care plan.',
  },
  {
    question: 'What information should I share in the booking form?',
    answer:
      'The booking form is strictly for appointment coordination: your name, mobile number, preferred date, and optional scheduling requests. Detailed medical records, test results, or sensitive histories should be shared privately during your one-on-one consultation.',
  },
  {
    question: 'What should I do in case of an acute medical emergency?',
    answer:
      'For severe, urgent, or life-threatening symptoms, immediately contact your local hospital emergency department or emergency services. VSHMA consultations are scheduled elective appointments and are not designed for emergency care.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      data-nav-theme="light"
      className="scroll-mt-[var(--nav-h)] py-12 lg:py-16 bg-ivory text-charcoal border-b border-sage/20"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-widest uppercase font-sans">
            <HelpCircle className="w-3.5 h-3.5 text-gold" />
            <span>Transparency &bull; Clarity</span>
          </div>

          <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-charcoal/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            Clear, honest answers regarding our consultations, booking protocol, and clinical boundaries.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-gold/50 shadow-md ring-1 ring-gold/20'
                    : 'bg-white/80 hover:bg-white border-sage/25 hover:border-sage/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-display text-sm font-semibold text-gold shrink-0">
                      0{index + 1}
                    </span>
                    <span className="font-heading font-semibold text-base sm:text-lg text-forest">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-sage-dark shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-charcoal/80 leading-relaxed font-sans font-light pl-11 border-t border-sage/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Quick Assistance Help Bar */}
        <div className="mt-10 p-6 rounded-3xl bg-forest-dark text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-white/10">
          <div className="text-center sm:text-left">
            <p className="font-heading font-semibold text-ivory text-base">
              Have a specific clinical or scheduling question?
            </p>
            <p className="text-xs text-sage-light font-light mt-0.5">
              Connect directly with our clinic team for personalized guidance.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Contact Page
            </Link>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#25D366] hover:bg-[#20ba5a] text-white transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
