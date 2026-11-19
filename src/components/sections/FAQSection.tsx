'use client';

import { ChevronDown, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';

const FAQS = [
  {
    question: 'What do the topics on this page mean?',
    answer: 'They are examples of health concerns someone may want to discuss. They are not a diagnosis, recommendation, promise of treatment, or statement that homeopathy is effective for those concerns.',
  },
  {
    question: 'Can homeopathy replace my prescribed treatment?',
    answer: 'No. Do not stop, delay, or change prescribed treatment based on information on this website. Discuss any care decisions with an appropriately qualified healthcare professional. The NIH NCCIH notes there is little evidence to support homeopathy as an effective treatment for any specific condition.',
  },
  {
    question: 'What should I include in the booking form?',
    answer: 'The form is for appointment coordination: name, mobile number, preferred date, and optional scheduling notes. Do not include detailed medical history, diagnoses, test results, or prescriptions.',
  },
  {
    question: 'How do I request an appointment?',
    answer: 'Submit the booking form to create a request and reference number. A pre-filled WhatsApp message will open for you to review and send manually. The clinic will confirm availability.',
  },
  {
    question: 'Are online or in-person appointments available?',
    answer: 'Contact VSHMA to confirm the current consultation format, appointment availability, and exact clinic address.',
  },
  {
    question: 'What should I do for urgent or worsening symptoms?',
    answer: 'Seek urgent medical care from an appropriately qualified healthcare professional or local emergency service. This website and its booking form are not for emergencies.',
  },
];

export default function FAQSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading align="left" className="mb-10 max-w-3xl" title="A few helpful answers" subtitle="Booking, treatment information, and what to expect when you contact the clinic." />
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {FAQS.map((faq, index) => (
            <details key={faq.question} className="group rounded-2xl border border-forest/10 bg-[#FAF9F4] px-5 py-1 transition-colors open:border-sage/50 open:bg-white sm:px-6">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold leading-6 text-forest marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start gap-3"><span className="mt-0.5 font-heading text-sm text-[#aa9562]">0{index + 1}</span>{faq.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-sage transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="max-w-prose pb-5 pl-8 text-sm leading-6 text-[#66736b]">{faq.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-forest/10 bg-[#f5f0e4] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-sm text-forest/75">Still have a scheduling question?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="text-sm font-semibold text-forest underline underline-offset-4">Contact VSHMA</Link>
            <a href="https://wa.me/917416001477" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-forest underline underline-offset-4"><MessageCircle className="h-4 w-4 text-[#238c57]" />WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
