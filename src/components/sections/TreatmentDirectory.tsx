'use client';

import Link from 'next/link';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Flower2,
  Sparkles,
  Apple,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  HelpCircle,
  ShieldAlert,
  Leaf,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Button from '@/components/ui/Button';
import { CLINIC_INFO } from '@/lib/constants';

interface FullTreatmentDetail {
  id: string;
  number: string;
  title: string;
  category: string;
  format: string;
  duration: string;
  overview: string;
  depthDescription: string;
  doctorPhilosophy: string;
  sessionSteps: {
    step: string;
    title: string;
    detail: string;
  }[];
  discussionTopics: string[];
  icon: React.ElementType;
}

const FULL_TREATMENTS: FullTreatmentDetail[] = [
  {
    id: 'general',
    number: '01',
    title: 'General Consultation',
    category: 'Primary Constitutional Care',
    format: 'In-Clinic (Bengaluru) & Online Video',
    duration: '45 to 60 Minutes',
    overview:
      'A thorough, unhurried initial assessment that forms the cornerstone of homeopathic care. Homeopathy views health as an integrated harmony between mind, body, and emotional constitution rather than a collection of disconnected symptoms.',
    depthDescription:
      'During your general consultation, Dr. Chihnitha Reddy T takes the time to listen to your entire health chronology — from earliest medical history and family predispositions to current complaints, sleep habits, thermal preferences, and emotional stresses. This granular mapping enables the identification of a single constitutional simillimum remedy designed to stimulate your body’s self-regulatory vital force.',
    doctorPhilosophy:
      'In classic homeopathy, we do not treat the disease in isolation — we treat the individual experiencing it. Understanding who you are is just as important as knowing what symptoms you experience.',
    sessionSteps: [
      {
        step: '01',
        title: 'Exhaustive Case Taking',
        detail:
          'Deep conversation covering physical symptoms, emotional state, food desires/aversions, energy cycles, and lifestyle environment.',
      },
      {
        step: '02',
        title: 'Constitutional Repertorization',
        detail:
          'Systematic analysis of your symptom totality to match your distinct physical-emotional profile with the precise homeopathic remedy.',
      },
      {
        step: '03',
        title: 'Treatment Roadmap & Lifestyle Advice',
        detail:
          'Clear guidance on remedy dosage, storage, dietary precautions (e.g. avoiding strong antidotes), and a structured follow-up timeline.',
      },
    ],
    discussionTopics: [
      'Chronic recurring complaints & vitality dips',
      'Stress-induced physical symptoms & tension',
      'Sleep disturbances & chronic fatigue',
      'Seasonal sensitivities & allergic tendencies',
      'Metabolic imbalances & lifestyle alignment',
      'Preventive wellness & vitality maintenance',
    ],
    icon: Stethoscope,
  },
  {
    id: 'ongoing',
    number: '02',
    title: 'Ongoing Consultations',
    category: 'Continuity & Progress Monitoring',
    format: 'In-Clinic & Follow-up Telehealth',
    duration: '20 to 30 Minutes',
    overview:
      'Regular follow-up appointments are vital to assess how your system has responded to the prescribed remedy, observe symptom shifts, and guide ongoing healing.',
    depthDescription:
      'Homeopathic healing often unfolds in layers following Hering’s Law of Cure — symptoms moving from more vital organs to less vital ones, or from within outward. Ongoing reviews ensure that your response is evaluated methodically, avoiding premature remedy changes while refining potencies when indicated.',
    doctorPhilosophy:
      'Healing is a progressive partnership. Each review helps us calibrate remedy potency and dosage to your evolving biological rhythm.',
    sessionSteps: [
      {
        step: '01',
        title: 'Response Assessment',
        detail:
          'Detailed review of initial improvements, subtle shifts in energy, sleep, mood, and changes in target physical symptoms.',
      },
      {
        step: '02',
        title: 'Posology & Potency Calibration',
        detail:
          'Careful decision whether to maintain current remedy action, wait for continued response, or step up potency.',
      },
      {
        step: '03',
        title: 'Continuing Support Plan',
        detail:
          'Scheduled check-ins and direct guidance regarding ongoing care and constitutional resilience.',
      },
    ],
    discussionTopics: [
      'Symptom frequency & intensity changes',
      'Overall vitality, stamina & sleep quality',
      'Response to current remedy potency',
      'Intercurrent health episodes or stresses',
      'Long-term constitutional stabilization',
      'Gradual reduction in symptom dependency',
    ],
    icon: HeartPulse,
  },
  {
    id: 'pediatric',
    number: '03',
    title: 'Pediatric Homeopathy',
    category: 'Gentle Care for Children',
    format: 'In-Clinic (Bengaluru) & Online Consultation',
    duration: '30 to 45 Minutes',
    overview:
      'Natural, non-invasive, sweet-tasting remedies tailored for newborns, toddlers, school-age children, and adolescents in a gentle, warm clinical environment.',
    depthDescription:
      'Children respond remarkably well to homeopathic remedies due to their dynamic, unencumbered vital force. Our consultations are designed to be completely calm, non-traumatic, and free of unpleasant medical procedures. Parents and guardians are central partners in observing behavior, appetite changes, sleep habits, and emotional dispositions.',
    doctorPhilosophy:
      'A child’s body has an inherent resilience. Our role is to support their natural defense mechanisms with gentle, sweet remedies that children take without fear.',
    sessionSteps: [
      {
        step: '01',
        title: 'Parental Observation Interview',
        detail:
          'Listening to parents regarding birth history, milestones, dietary preferences, temperature sensitivity, and temperament.',
      },
      {
        step: '02',
        title: 'Child-Centric Interaction',
        detail:
          'Gentle, friendly interaction with the child in an unhurried, reassuring environment without scary instruments.',
      },
      {
        step: '03',
        title: 'Safe Sugar-Globule Dispensation',
        detail:
          'Sweet lactose globule remedies that dissolve easily in the mouth, accompanied by clear storage and dosage instructions.',
      },
    ],
    discussionTopics: [
      'Recurrent seasonal coughs, colds & runny noses',
      'Digestive colic, finicky eating & appetite issues',
      'Teething discomfort & infant sleep rhythms',
      'Skin dryness, rashes & sensitive skin',
      'School stress, anxiety & exam nervousness',
      'Natural immunity & general physical growth',
    ],
    icon: Baby,
  },
  {
    id: 'womens-health',
    number: '04',
    title: "Women's Health",
    category: 'Holistic Female Wellness',
    format: 'Private In-Clinic & Confidential Video',
    duration: '40 to 50 Minutes',
    overview:
      'Compassionate, completely confidential consultations honoring the biological and emotional phases of womanhood — from adolescence to motherhood and menopause.',
    depthDescription:
      'A woman’s endocrine and reproductive health is intimately linked to emotional equilibrium, stress levels, nutrition, and metabolic vitality. Rather than artificially suppressing hormonal fluctuations with synthetic agents, constitutional homeopathy seeks to restore organic equilibrium to the hypothalamic-pituitary-ovarian axis naturally.',
    doctorPhilosophy:
      'Every phase of a woman’s life brings unique biological shifts. We provide a safe, respectful space to discuss concerns and nurture organic hormonal harmony.',
    sessionSteps: [
      {
        step: '01',
        title: 'Confidential Case History',
        detail:
          'Sensitive discussion of menstrual cycles, flow characteristics, pain patterns, mood swings, and emotional pressures.',
      },
      {
        step: '02',
        title: 'Hormonal & Lifestyle Assessment',
        detail:
          'Evaluating thyroid health, stress markers, dietary balance, sleep adequacy, and reproductive history.',
      },
      {
        step: '03',
        title: 'Constitutional Treatment Protocol',
        detail:
          'Remedies chosen to harmonize menstrual rhythm, ease transitions, and elevate overall day-to-day vitality.',
      },
    ],
    discussionTopics: [
      'Irregular, painful, or heavy menstrual cycles',
      'Premenstrual mood changes & physical discomfort',
      'Perimenopause & menopausal hot flashes/night sweats',
      'Postpartum emotional well-being & recovery',
      'Stress-induced hormonal & sleep imbalances',
      'Overall reproductive and metabolic vitality',
    ],
    icon: Flower2,
  },
  {
    id: 'skin-hair',
    number: '05',
    title: 'Skin & Hair Care',
    category: 'Root-Cause Dermatology Support',
    format: 'In-Clinic & Visual Telehealth',
    duration: '35 to 45 Minutes',
    overview:
      'Targeting internal systemic triggers, food sensitivities, and constitutional factors behind recurrent skin flare-ups and hair concerns without relying on suppressive topical steroids.',
    depthDescription:
      'In homeopathic philosophy, the skin is an excretory organ and a sensitive mirror of internal systemic health. Suppressing chronic skin eruptions with strong chemical topicals often forces the disturbance deeper into internal organs. Our approach investigates digestive health, liver function, stress levels, and genetic tendencies to stimulate internal cleansing and lasting skin balance.',
    doctorPhilosophy:
      'Healthy skin and lustrous hair reflect internal metabolic equilibrium. We work from within outward rather than masking surface signs.',
    sessionSteps: [
      {
        step: '01',
        title: 'Trigger & Chronology Mapping',
        detail:
          'Identifying seasonal patterns, weather sensitivities, food allergies, emotional stressors, and past topical suppressions.',
      },
      {
        step: '02',
        title: 'Constitutional Selection',
        detail:
          'Selecting remedies matching both your skin manifestation (dryness, itching, burning) and your holistic personal constitution.',
      },
      {
        step: '03',
        title: 'Skin Barrier Protection Advice',
        detail:
          'Practical guidance on gentle natural skincare, hydration, non-irritating fabrics, and nutritional support.',
      },
    ],
    discussionTopics: [
      'Chronic eczema, dry flaky patches & itching',
      'Recurrent acne & hormonal skin eruptions',
      'Scalp sensitivities, dandruff & excessive hair fall',
      'Urticaria (hives) & allergic skin flare-ups',
      'Hyperpigmentation & constitutional skin support',
      'Nail strength & healthy keratin growth',
    ],
    icon: Sparkles,
  },
  {
    id: 'digestive',
    number: '06',
    title: 'Digestive Health',
    category: 'Gastrointestinal & Metabolic Vitality',
    format: 'In-Clinic & Online Consultation',
    duration: '35 to 45 Minutes',
    overview:
      'Comprehensive assessment of recurrent digestive sensitivities, gut-brain axis disturbances, acid imbalances, and metabolic sluggishness.',
    depthDescription:
      'The digestive tract is often referred to as the second brain. Stress, emotional turmoil, irregular eating hours, and sedentary routines deeply impact peristalsis, bile production, and gut microbiome balance. Homeopathic constitutional treatment aims to restore the tone of digestive organs and re-establish regular organic rhythm.',
    doctorPhilosophy:
      'Optimal digestion is the foundation of whole-body energy and immunity. We address both the emotional and physical facets of gut health.',
    sessionSteps: [
      {
        step: '01',
        title: 'Digestive Habit Analysis',
        detail:
          'Review of meal timings, specific food intolerances, bloating patterns, bowel regularity, and hydration.',
      },
      {
        step: '02',
        title: 'Stress-Gut Correlation',
        detail:
          'Evaluating how daily stress and emotional tension correlate with flare-ups of acid reflux or abdominal discomfort.',
      },
      {
        step: '03',
        title: 'Remedy & Dietary Recommendations',
        detail:
          'Tailored remedies to calm digestive spasms and optimize nutrient absorption, paired with sustainable dietary habits.',
      },
    ],
    discussionTopics: [
      'Chronic acidity, heartburn & acid reflux',
      'Persistent bloating, gas & indigestion',
      'Irregular bowel habits (constipation/sluggishness)',
      'Stress-induced abdominal cramps & tension',
      'Food intolerances & post-meal heavy sensations',
      'Metabolic vitality & post-illness digestive recovery',
    ],
    icon: Apple,
  },
];

export default function TreatmentDirectory() {
  return (
    <div className="bg-[#FAF9F4] min-h-screen">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <header className="relative bg-white border-b border-sage/20 pt-28 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mint/70 border border-sage/30 text-forest text-xs font-semibold uppercase tracking-wider mb-4">
            <Leaf className="w-3.5 h-3.5 text-sage-dark" />
            <span>VSHMA Clinical Directory &bull; Bengaluru</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-forest tracking-tight max-w-4xl leading-[1.1]">
            Comprehensive Consultation &amp; Treatment Guide
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg text-gray-700 leading-relaxed font-light">
            Explore detailed information on consultation methodologies, case-taking procedures, and constitutional homeopathic care led by{' '}
            <strong className="font-semibold text-forest">{CLINIC_INFO.doctor}</strong> ({CLINIC_INFO.qualification}) in Bengaluru.
          </p>

          {/* Quick-Jump Treatment Navigation Bar */}
          <div className="mt-8 pt-6 border-t border-sage/20 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap mr-2">
              Jump To:
            </span>
            {FULL_TREATMENTS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-sage/30 text-forest hover:bg-forest hover:text-white transition-colors whitespace-nowrap shadow-sm"
              >
                {t.number} {t.title}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Ethical Medical Information Notice */}
        <div className="mb-14 p-5 sm:p-6 rounded-2xl bg-white border border-sage/30 shadow-sm flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-gold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-forest">
              Clinical &amp; Educational Scope Notice
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              This guide provides general clinical information regarding the constitutional homeopathic consultation process. Homeopathic care is tailored individually to each patient’s unique symptoms and constitution. It is not an alternative for emergency trauma care, acute surgical emergencies, or life-threatening conditions. Always consult a qualified medical professional for urgent health matters.
            </p>
          </div>
        </div>

        {/* =========================================================================
            6 DETAILED TREATMENT SECTIONS (Subtle, Natural Scrolling, Zero Clunky Animation)
            ========================================================================= */}
        <div className="space-y-16 sm:space-y-20">
          {FULL_TREATMENTS.map((treatment) => {
            const Icon = treatment.icon;

            return (
              <article
                key={treatment.id}
                id={treatment.id}
                className="scroll-mt-28 bg-white rounded-3xl p-6 sm:p-10 border border-sage/25 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-sage/20">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-forest text-gold flex items-center justify-center shrink-0 shadow-md">
                      <Icon className="w-8 h-8" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-forest text-gold">
                          Option {treatment.number}
                        </span>
                        <span className="text-xs font-semibold text-forest px-3 py-0.5 rounded-full bg-mint border border-sage/30">
                          {treatment.category}
                        </span>
                      </div>

                      <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-forest">
                        {treatment.title}
                      </h2>
                    </div>
                  </div>

                  {/* Consultation Logistics Specs */}
                  <div className="flex flex-wrap items-center gap-3 bg-[#FAF9F4] p-3 rounded-2xl border border-sage/20 lg:shrink-0 text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gold" />
                      <span><strong>Duration:</strong> {treatment.duration}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-forest" />
                      <span>{treatment.format}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Overview */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 space-y-4">
                    <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-normal">
                      {treatment.overview}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light">
                      {treatment.depthDescription}
                    </p>

                    {/* Doctor's Philosophy Quote Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-mint/50 border border-sage/25 flex items-start gap-3 text-sm text-forest/90 italic font-light mt-4">
                      <Leaf className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                      <div>
                        <p>&ldquo;{treatment.doctorPhilosophy}&rdquo;</p>
                        <p className="text-xs font-semibold not-italic text-forest mt-2">
                          — {CLINIC_INFO.doctor} ({CLINIC_INFO.qualification}), Homeopathy Practitioner
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Common Discussion Topics */}
                  <div className="lg:col-span-4 bg-[#FAF9F4] p-6 rounded-2xl border border-sage/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-forest mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Common Discussion Topics
                    </h3>
                    <ul className="space-y-2.5">
                      {treatment.discussionTopics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* What Happens During the Session (3 Structured Steps) */}
                <div className="mt-10 pt-8 border-t border-sage/20">
                  <h3 className="font-heading text-xl font-bold text-forest mb-6">
                    What to Expect During Your Consultation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {treatment.sessionSteps.map((step) => (
                      <div
                        key={step.step}
                        className="p-5 rounded-2xl bg-[#FAF9F4] border border-sage/15 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-2xl font-bold text-gold">
                            {step.step}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-forest" />
                        </div>
                        <h4 className="font-heading text-base font-bold text-forest">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed font-light">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Treatment Direct Actions */}
                <div className="mt-8 pt-6 border-t border-sage/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-xs text-gray-500">
                    Consultation available in-person in Bengaluru or online via video.
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/book?type=${encodeURIComponent(treatment.title)}`}>
                      <Button size="md" className="rounded-full shadow-md text-xs font-semibold">
                        <span>Book {treatment.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>

                    <a
                      href={`https://wa.me/917416001477?text=${encodeURIComponent(
                        `Hello Dr. Chihnitha / VSHMA Clinic, I would like to inquire about the ${treatment.title}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                      <span>WhatsApp Inquire</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* =========================================================================
            FREQUENTLY ASKED QUESTIONS SECTION
            ========================================================================= */}
        <section className="mt-20 pt-16 border-t border-sage/25">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-forest px-3 py-1 rounded-full bg-mint">
              Patient Guidance
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-forest mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-sm mt-2 font-light">
              Clear, transparent answers regarding consultation arrangements and homeopathic care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-white border border-sage/20 shadow-sm space-y-2">
              <h3 className="font-heading text-lg font-bold text-forest flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>What should I prepare for my first consultation?</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light pl-7">
                Bring any recent medical reports, test results, and a list of all current medications or supplements you are taking. Be prepared to talk about your sleep, appetite, thermal preferences, and emotional stresses in addition to your physical symptoms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/20 shadow-sm space-y-2">
              <h3 className="font-heading text-lg font-bold text-forest flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>Can I consult online if I live outside Bengaluru?</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light pl-7">
                Yes. Online consultations are conducted over private, secure video appointments. Detailed case taking is performed in the same depth as in-clinic visits, with prescriptions and remedy guidance provided directly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/20 shadow-sm space-y-2">
              <h3 className="font-heading text-lg font-bold text-forest flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>Can I take homeopathic medicines alongside other prescriptions?</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light pl-7">
                Yes. Homeopathic micro-dilutions do not interact with allopathic pharmacological receptors. You should never stop prescribed conventional medicines without the advice of your treating physician. Always inform Dr. Chihnitha of all active medications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/20 shadow-sm space-y-2">
              <h3 className="font-heading text-lg font-bold text-forest flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>How long does homeopathic treatment typically take?</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light pl-7">
                The timeframe depends on whether the complaint is acute (where response can occur quickly) or chronic and deep-seated (which requires progressive constitutional adjustment over several months). Dr. Chihnitha will outline realistic expectations during your initial session.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Card */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-forest text-white text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            Ready to Begin Your Personal Health Journey?
          </h3>
          <p className="text-sage-light text-sm sm:text-base max-w-xl mx-auto mb-8 font-light">
            Schedule a consultation with Dr. Chihnitha Reddy T in Bengaluru or inquire directly via WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-forest font-semibold rounded-full shadow-lg">
                Schedule Consultation Now
              </Button>
            </Link>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>Ask on WhatsApp ({CLINIC_INFO.phone})</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
