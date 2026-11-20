'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Flower2,
  Sparkles,
  Apple,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

interface TreatmentDetail {
  id: string;
  number: string;
  title: string;
  category: string;
  format: string;
  duration: string;
  overview: string;
  depthDescription: string;
  doctorPhilosophy: string;
  sessionSteps: { step: string; title: string; detail: string }[];
  discussionTopics: string[];
  icon: typeof Stethoscope;
}

const TREATMENTS_DATA: TreatmentDetail[] = [
  {
    id: 'general-consultation',
    number: '01',
    title: 'General Consultation',
    category: 'Initial Clinical Evaluation',
    format: 'In-Clinic (Bengaluru) & Online Video',
    duration: '45 to 60 Minutes',
    overview:
      'A thorough, unhurried initial assessment that forms the cornerstone of homeopathic care. Homeopathy evaluates health through an integrated view of physical, emotional, and lifestyle factors.',
    depthDescription:
      'During your general consultation, Dr. Chihnitha Reddy T takes the time to listen to your entire health chronology — from past medical history and family wellness patterns to daily energy cycles, sleep quality, and emotional stressors. This granular understanding enables the selection of individualized constitutional remedies tailored to your system.',
    doctorPhilosophy:
      'In classical homeopathy, we do not view symptoms in isolation — we listen to the individual experiencing them. Understanding your unique constitution is central to providing thoughtful, personalized care.',
    sessionSteps: [
      {
        step: '01',
        title: 'Attentive Case Review',
        detail:
          'Deep conversation covering current concerns, physical sensations, lifestyle environment, sleep, and emotional wellbeing.',
      },
      {
        step: '02',
        title: 'Constitutional Evaluation',
        detail:
          'Systematic analysis of your symptom totality to select homeopathic therapeutics aligned with your unique personal profile.',
      },
      {
        step: '03',
        title: 'Care Roadmap & Guidance',
        detail:
          'Clear explanations on remedy usage, dietary precautions, lifestyle alignment, and structured review timelines.',
      },
    ],
    discussionTopics: [
      'Chronic recurring complaints & vitality dips',
      'Stress-related physical tension & fatigue',
      'Sleep patterns & daytime energy rhythms',
      'Seasonal sensitivities & environmental reactions',
      'Lifestyle balance & preventive wellness',
    ],
    icon: Stethoscope,
  },
  {
    id: 'ongoing-consultations',
    number: '02',
    title: 'Ongoing Consultations',
    category: 'Continuity & Progress Monitoring',
    format: 'In-Clinic & Follow-up Telehealth',
    duration: '20 to 30 Minutes',
    overview:
      'Regular follow-up appointments are designed to assess response to prescribed remedies, track symptom progression, and adjust care plans.',
    depthDescription:
      'Individual responses to homeopathic therapeutics vary. Follow-up reviews provide a dedicated space to discuss observed changes in your overall energy, sleep, and primary symptoms. Dosages and remedy selections are calibrated progressively to support your evolving health journey.',
    doctorPhilosophy:
      'Care is an ongoing collaborative partnership. Each review helps us understand your body’s response and make informed adjustments.',
    sessionSteps: [
      {
        step: '01',
        title: 'Response Assessment',
        detail:
          'Structured review of shifts in energy, sleep quality, mood, and target physical concerns since your last visit.',
      },
      {
        step: '02',
        title: 'Care Plan Calibration',
        detail:
          'Thoughtful clinical decision whether to continue the current regimen, pause for further observation, or adjust remedy selection.',
      },
      {
        step: '03',
        title: 'Continuing Support',
        detail:
          'Direct guidance on lifestyle modifications and scheduling your next review interval.',
      },
    ],
    discussionTopics: [
      'Rate and quality of symptomatic changes',
      'Changes in stamina, mood, and sleep patterns',
      'Remedy tolerance and dosage adjustments',
      'Long-term constitutional health goals',
    ],
    icon: HeartPulse,
  },
  {
    id: 'pediatric-homeopathy',
    number: '03',
    title: 'Pediatric Homeopathy',
    category: 'Gentle Care for Infants & Children',
    format: 'In-Clinic (Bengaluru) & Telehealth',
    duration: '30 to 45 Minutes',
    overview:
      'Gentle, child-friendly consultations tailored for infants, toddlers, and school-age children, conducted with warmth and active parental involvement.',
    depthDescription:
      'Children often respond sensitively to gentle interventions. Consultations for younger patients involve a detailed conversation with parents regarding feeding habits, milestones, sleep patterns, emotional disposition, and recurrent seasonal complaints. Remedies are pleasant-tasting and easy to administer.',
    doctorPhilosophy:
      'Working with children requires patience, keen clinical observation, and trust. We ensure young patients feel safe while partnering closely with parents.',
    sessionSteps: [
      {
        step: '01',
        title: 'Parent-Practitioner Dialogue',
        detail:
          'Detailed discussion of birth history, milestones, appetite, sleep patterns, and family health tendencies.',
      },
      {
        step: '02',
        title: 'Gentle Child Observation',
        detail:
          'Evaluating temperament, physical constitution, and natural behavioral responses in a calm, non-threatening environment.',
      },
      {
        step: '03',
        title: 'Pediatric Care Plan',
        detail:
          'Easy-to-administer sweet globule remedies paired with practical parental guidance on nutrition, hydration, and restful routines.',
      },
    ],
    discussionTopics: [
      'Recurrent seasonal coughs, colds & nasal congestion',
      'Digestive comfort & fussy eating patterns',
      'Sleep restlessness & bed-time anxiety',
      'Skin comfort & sensitivity reactions',
      'General growth, vitality & childhood wellness',
    ],
    icon: Baby,
  },
  {
    id: 'womens-health',
    number: '04',
    title: "Women's Health",
    category: 'Supportive Female Wellness',
    format: 'Private In-Clinic & Confidential Video',
    duration: '40 to 50 Minutes',
    overview:
      'Compassionate, confidential consultations honoring the physical and emotional phases of womanhood — from adolescence to postpartum recovery and menopausal transitions.',
    depthDescription:
      'A woman’s physiological and emotional wellbeing is closely connected with sleep, nutrition, stress, and hormonal transitions. Dr. Chihnitha provides an empathetic, supportive environment to discuss menstrual cycle changes, perimenopausal fluctuations, emotional stress, and vitality, offering personalized homeopathic options complementary to conventional gynecological care.',
    doctorPhilosophy:
      'Every phase of a woman’s life brings distinct biological and emotional shifts. We provide a respectful, private space to explore these changes with empathy.',
    sessionSteps: [
      {
        step: '01',
        title: 'Confidential History Taking',
        detail:
          'Private discussion of menstrual rhythms, cycle discomfort, sleep quality, energy levels, and life stressors.',
      },
      {
        step: '02',
        title: 'Holistic Lifestyle Assessment',
        detail:
          'Evaluating dietary habits, physical activity, emotional pressures, and medical history.',
      },
      {
        step: '03',
        title: 'Individualized Protocol',
        detail:
          'Selection of constitutional remedies aimed at supporting vitality, ease during transitions, and overall emotional balance.',
      },
    ],
    discussionTopics: [
      'Menstrual cycle regularity and related discomfort',
      'Perimenopause and menopausal physical/emotional transitions',
      'Postpartum emotional adjustment and vitality',
      'Stress-associated fatigue and sleep disturbances',
      'Integrative support alongside gynecological care',
    ],
    icon: Flower2,
  },
  {
    id: 'skin-hair-care',
    number: '05',
    title: 'Skin & Hair Care',
    category: 'Constitutional Dermatology Support',
    format: 'In-Clinic & Visual Telehealth',
    duration: '35 to 45 Minutes',
    overview:
      'Exploring systemic factors, environmental triggers, stress markers, and constitutional predispositions contributing to persistent skin or scalp concerns.',
    depthDescription:
      'The skin and hair often reflect broader constitutional wellbeing, stress levels, hydration, and digestion. Rather than looking solely at surface manifestations, our homeopathic evaluation investigates underlying stress patterns, seasonal triggers, and nutritional rhythms to recommend individualized remedies that support constitutional balance.',
    doctorPhilosophy:
      'Skin and scalp comfort are deeply connected with internal balance, stress management, and daily habits. We seek to understand the whole person behind the condition.',
    sessionSteps: [
      {
        step: '01',
        title: 'Chronology & Trigger Mapping',
        detail:
          'Documenting when flare-ups occur, weather influences, stress correlations, and personal hygiene habits.',
      },
      {
        step: '02',
        title: 'Constitutional Remedy Selection',
        detail:
          'Selecting remedies matching both the specific characteristics of your skin or scalp discomfort and your general constitutional profile.',
      },
      {
        step: '03',
        title: 'Gentle Care & Lifestyle Advice',
        detail:
          'Recommendations on gentle cleansing, hydration, stress reduction techniques, and dietary considerations.',
      },
    ],
    discussionTopics: [
      'Dryness, sensitivity, and seasonal skin reactivity',
      'Stress-related skin flare-ups and itching',
      'Scalp health and hair fall concerns',
      'Digestive correlations with skin appearance',
      'Support alongside conventional dermatological care',
    ],
    icon: Sparkles,
  },
  {
    id: 'digestive-health',
    number: '06',
    title: 'Digestive & Metabolic Wellness',
    category: 'Gastrointestinal & Lifestyle Rhythms',
    format: 'In-Clinic & Telehealth',
    duration: '35 to 45 Minutes',
    overview:
      'Comprehensive evaluations of digestive comfort, appetite patterns, bowel regularity, and stress-related gut reactions with individualized homeopathic guidance.',
    depthDescription:
      'Digestive health is profoundly influenced by meal timings, emotional stress, anxiety, and constitutional sensitivities. In our consultations, Dr. Chihnitha reviews food preferences, bloating triggers, metabolic energy dips, and bowel habits to formulate a tailored homeopathic approach that supports natural digestive rhythm.',
    doctorPhilosophy:
      'The gut is a sensitive barometer of both physical habits and emotional state. Restoring digestive comfort requires addressing both.',
    sessionSteps: [
      {
        step: '01',
        title: 'Dietary & Rhythm Analysis',
        detail:
          'Detailed review of meal schedules, trigger foods, appetite fluctuations, and gastrointestinal symptoms.',
      },
      {
        step: '02',
        title: 'Stress-Gut Correlation',
        detail:
          'Investigating the connection between emotional tension, work rhythms, and digestive discomfort.',
      },
      {
        step: '03',
        title: 'Targeted Constitutional Care',
        detail:
          'Prescribing remedies tailored to your specific digestive tendencies alongside actionable dietary and hydration advice.',
      },
    ],
    discussionTopics: [
      'Frequent acidity, reflux sensations & bloating',
      'Irregular bowel motility & sluggish digestion',
      'Stress-induced abdominal cramps or discomfort',
      'Food sensitivities & post-meal lethargy',
      'Nutritional rhythm & digestive wellness',
    ],
    icon: Apple,
  },
];

const TREATMENTS_FAQ = [
  {
    question: 'How long does an initial consultation take?',
    answer:
      'Initial general consultations typically last 45 to 60 minutes. This allows Dr. Chihnitha to thoroughly evaluate your medical chronology, lifestyle, emotional stress, and constitutional traits without rushing.',
  },
  {
    question: 'Can I take homeopathic remedies alongside my allopathic medications?',
    answer:
      'Yes, in most cases homeopathic remedies can be safely used alongside conventional treatments. However, it is essential to inform Dr. Chihnitha as well as your prescribing physician of all treatments, supplements, and remedies you are taking.',
  },
  {
    question: 'Are online consultations as thorough as in-clinic visits?',
    answer:
      'Yes. Our video consultations follow the exact same classical case-taking methodology. They are ideal for follow-ups, remote patients, or individuals who cannot travel to the Bengaluru clinic.',
  },
  {
    question: 'How are prescribed remedies received after an online appointment?',
    answer:
      'Following a virtual consultation, Dr. Chihnitha provides a clear clinical guidance slip and instructions on obtaining authentic remedies, or coordinates local courier delivery where appropriate.',
  },
];

export default function TreatmentDirectory() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-ivory text-charcoal">
      {/* Page Header */}
      <section className="relative py-20 sm:py-28 bg-forest text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-ivory text-xs font-semibold uppercase tracking-widest font-sans border border-white/15">
              <span>Clinical Practice Guide</span>
            </div>
            <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-7xl text-ivory leading-[1.05] tracking-tight">
              Consultations &amp; Care Directory
            </h1>
            <p className="text-sage-light text-base sm:text-lg lg:text-xl font-light font-sans leading-relaxed">
              Explore our clinical consultation offerings, case-taking procedures, and areas of focus with Dr. Chihnitha Reddy T (BHMS) in Bengaluru.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Medical Notice Bar */}
      <section className="bg-white border-b border-sage/20 py-4">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center gap-3 text-xs text-charcoal/75 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Practitioner Note: </strong> Homeopathy is an individualized therapeutic system. Consultations are exploratory and tailored to individual constitutions, working responsibly alongside evidence-based healthcare.
          </span>
        </div>
      </section>

      {/* Quick Jump Bar */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-sage/20 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold font-sans">
            <span className="text-gold uppercase tracking-wider text-[10px] shrink-0 mr-2">Jump to:</span>
            {TREATMENTS_DATA.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="px-3 py-1.5 rounded-full bg-ivory hover:bg-forest hover:text-white text-forest/80 border border-sage/25 whitespace-nowrap transition-colors"
              >
                {t.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Treatment Articles */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-20">
        {TREATMENTS_DATA.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.id}
              id={item.id}
              className="scroll-mt-36 p-8 sm:p-12 lg:p-14 rounded-[2.5rem] bg-white border border-sage/25 shadow-md space-y-10"
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-sage/15">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-light text-gold">{item.number}</span>
                    <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider font-sans">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-forest leading-tight">
                    {item.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal/75 font-sans">
                  <div className="flex items-center gap-1.5 bg-ivory px-3.5 py-2 rounded-xl border border-sage/20">
                    <Clock className="w-4 h-4 text-gold" />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-ivory px-3.5 py-2 rounded-xl border border-sage/20">
                    <Icon className="w-4 h-4 text-forest" />
                    <span>{item.format}</span>
                  </div>
                </div>
              </div>

              {/* Overview & Depth Description */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4 text-charcoal/85 text-base sm:text-lg leading-relaxed font-sans font-light">
                  <p className="font-normal text-forest">{item.overview}</p>
                  <p>{item.depthDescription}</p>
                </div>

                {/* Doctor Philosophy Quote Box */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-forest-dark text-white space-y-3 shadow-lg">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold block font-sans">
                    Doctor&apos;s Philosophy
                  </span>
                  <p className="font-serif italic text-sm text-ivory/90 leading-relaxed">
                    &ldquo;{item.doctorPhilosophy}&rdquo;
                  </p>
                  <p className="text-[11px] text-sage-light pt-2 border-t border-white/10 font-sans">
                    &mdash; {CLINIC_INFO.doctor} ({CLINIC_INFO.qualification})
                  </p>
                </div>
              </div>

              {/* 3 Steps of this consultation */}
              <div className="space-y-4 pt-4">
                <h3 className="font-heading font-semibold text-forest text-xl">
                  Consultation Progression
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {item.sessionSteps.map((s) => (
                    <div key={s.step} className="p-5 rounded-2xl bg-ivory border border-sage/20 space-y-2">
                      <span className="font-display text-lg text-gold font-semibold">{s.step}</span>
                      <h4 className="font-heading font-semibold text-forest text-base">{s.title}</h4>
                      <p className="text-xs text-charcoal/70 leading-relaxed font-light">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Topics & CTA */}
              <div className="pt-6 border-t border-sage/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold font-sans">
                    Common Consultation Focus Areas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.discussionTopics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sage/30 text-xs text-charcoal/80 font-sans"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link
                    href={`/book?type=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-forest hover:bg-forest-light text-white text-xs font-semibold font-sans tracking-wide shadow-md transition-all"
                  >
                    <span>Request Slot</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>

                  <a
                    href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                      `Hello Dr. Chihnitha, I would like to schedule a ${item.title} at VSHMA Clinic.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold font-sans transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Directory FAQ Accordion */}
      <section className="py-20 bg-white border-t border-sage/20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold block font-sans">
              Frequently Asked Questions
            </span>
            <h2 className="font-display font-light text-3xl sm:text-4xl text-forest">
              About Our Consultations
            </h2>
          </div>

          <div className="space-y-3">
            {TREATMENTS_FAQ.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-sage/25 bg-ivory overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-heading font-semibold text-forest text-base cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-gold text-xl font-mono">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-charcoal/80 leading-relaxed font-sans font-light border-t border-sage/15 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Booking CTA Banner */}
      <section className="py-20 bg-forest text-white text-center">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-6">
          <h2 className="font-display font-light text-3xl sm:text-5xl text-ivory">
            Ready to schedule your consultation?
          </h2>
          <p className="text-sage-light text-base sm:text-lg font-light max-w-xl mx-auto font-sans">
            Connect with VSHMA in Bengaluru. Experience unhurried clinical attention and personalized homeopathic care.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gold hover:bg-gold-light text-forest-deep font-sans font-semibold text-xs tracking-wider uppercase shadow-lg transition-all"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              <span>Book an Appointment</span>
            </Link>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold font-sans tracking-wide transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp: +91 {CLINIC_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
