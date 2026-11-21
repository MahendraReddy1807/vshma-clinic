/**
 * VSHMA Homeopathy Clinic — Single Source of Truth
 * Dr. Chihnitha Reddy T (BHMS) • Bengaluru, Karnataka, India
 *
 * Rules:
 * - Verified facts are typed and locked.
 * - Any information awaiting client/practitioner confirmation is explicitly typed with `TODO` and falls back gracefully.
 * - Do NOT fabricate registration numbers, street addresses, or fee amounts.
 */

export interface ConsultationTypeConfig {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  durationInitial: string;
  durationReview: string;
  description: string;
  focusAreas: string[];
  glyph: 'crescent' | 'semi-stacked' | 'half-leaf' | 'orbital-cross';
}

export interface SiteConfig {
  clinic: {
    name: string;
    fullName: string;
    tagline: string;
    city: string;
    state: string;
    country: string;
    /** Full physical street address: TODO awaiting client input */
    fullAddress: string | null;
    landmarks: string | null;
    googleMapsEmbedUrl: string | null;
    googleMapsPlaceUrl: string | null;
    googleBusinessProfileUrl: string | null;
    operatingHours: {
      weekday: string;
      saturday: string;
      sunday: string;
      note: string;
    };
  };
  doctor: {
    name: string;
    degree: string;
    degreeFull: string;
    leadRole: string;
    specialization: string;
    /** Official State Homeopathy Council Registration: TODO awaiting client input */
    registrationNumber: string | null;
    registrationAuthority: string | null;
    /** Years of active clinical practice: TODO awaiting client input */
    yearsExperience: string | null;
    bioShort: string;
    philosophyQuote: string;
  };
  contact: {
    phoneDisplay: string;
    phoneE164: string;
    phoneTelHref: string;
    whatsappNumber: string;
    whatsappUrl: string;
    email: string;
    canonicalDomain: string;
  };
  fees: {
    disclosureNotice: string;
    initialFee: string | null;
    reviewFee: string | null;
  };
  consultations: ConsultationTypeConfig[];
}

export const SITE_CONFIG: SiteConfig = {
  clinic: {
    name: 'VSHMA',
    fullName: 'VSHMA Homeopathy Clinic',
    tagline: 'Compassionate clinical care, rooted in personal dialogue.',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    // TODO: Client to provide exact building, street, and postal pin code
    fullAddress: null,
    landmarks: 'Bengaluru Clinic — Exact street coordinates provided upon appointment confirmation',
    // TODO: Add Google Maps Place link once Google Business Profile is connected
    googleMapsEmbedUrl: null,
    googleMapsPlaceUrl: 'https://maps.google.com/?q=Bengaluru+Karnataka+India',
    googleBusinessProfileUrl: null,
    operatingHours: {
      weekday: 'Monday – Friday: 9:00 AM – 7:00 PM',
      saturday: 'Saturday: 9:00 AM – 7:00 PM',
      sunday: 'Sunday: By Prior Arrangement',
      note: 'All consultations are conducted strictly by prior reservation.',
    },
  },
  doctor: {
    name: 'Dr. Chihnitha Reddy T',
    degree: 'BHMS',
    degreeFull: 'Bachelor of Homeopathic Medicine & Surgery',
    leadRole: 'Lead Practitioner & Founder',
    specialization: 'Classical Constitutional Homeopathy',
    // TODO: Client to supply Karnataka/Central State Council registration number
    registrationNumber: null,
    registrationAuthority: 'Karnataka State Homeopathic Medical Council',
    // TODO: Client to supply verified years of clinical experience
    yearsExperience: null,
    bioShort:
      'Dr. Chihnitha Reddy T is a qualified Homeopathic Practitioner holding a Bachelor of Homeopathic Medicine and Surgery (BHMS). She founded VSHMA Homeopathy Clinic to provide patients with a private, focused clinical environment where natural medicine is practiced with thorough clinical attention.',
    philosophyQuote:
      'We look at the whole person, not just isolated symptoms. Healing begins when a patient feels completely heard.',
  },
  contact: {
    phoneDisplay: '+91 7416001477',
    phoneE164: '+917416001477',
    phoneTelHref: 'tel:+917416001477',
    whatsappNumber: '917416001477',
    whatsappUrl: 'https://wa.me/917416001477',
    email: 'care@vshma.in',
    canonicalDomain: 'https://vshma.in',
  },
  fees: {
    disclosureNotice: 'Consultation fee schedule is shared transparently upon appointment reservation.',
    initialFee: null,
    reviewFee: null,
  },
  consultations: [
    {
      id: 'general-consultation',
      number: '01',
      title: 'General Consultation',
      subtitle: 'First-time health intake',
      category: 'Foundation Intake',
      durationInitial: '45–60 min',
      durationReview: '20–30 min',
      description:
        'A comprehensive first-time consultation exploring physical complaints, personal health chronology, lifestyle patterns, and sensitivity triggers.',
      focusAreas: ['Comprehensive health intake', 'Lifestyle and daily rhythm review', 'Tailored homeopathic formulation'],
      glyph: 'crescent',
    },
    {
      id: 'ongoing-review',
      number: '02',
      title: 'Ongoing & Follow-Up Care',
      subtitle: 'Longitudinal health progress',
      category: 'Continuity of Care',
      durationInitial: '30–45 min',
      durationReview: '20–30 min',
      description:
        'Periodic evaluation for existing patients to assess remedy response, fine-tune dosage, and support sustained vitality.',
      focusAreas: ['Systematic symptom progress check', 'Remedy response tracking', 'Fine-tuned prescription regimen'],
      glyph: 'semi-stacked',
    },
    {
      id: 'pediatric-wellness',
      number: '03',
      title: 'Pediatric & Family Wellness',
      subtitle: 'Gentle support for children',
      category: 'Pediatric Care',
      durationInitial: '45–60 min',
      durationReview: '20–30 min',
      description:
        'Gentle, palatable natural therapeutics designed for infants and children, supporting natural immunity, sleep cycles, and seasonal resilience.',
      focusAreas: ['Recurrent seasonal cough & cold support', 'Digestive and infant colic evaluation', 'Calm child-friendly atmosphere'],
      glyph: 'half-leaf',
    },
    {
      id: 'womens-health',
      number: '04',
      title: "Women's Hormonal Health",
      subtitle: 'Cycle & vitality balance',
      category: 'Hormonal Wellness',
      durationInitial: '45–60 min',
      durationReview: '20–30 min',
      description:
        'Supportive consultations addressing cycle regularity, perimenopausal shifts, hormonal headaches, and emotional equilibrium.',
      focusAreas: ['Supportive care for irregular cycles', 'Perimenopausal and hormonal rhythms', 'Safe, non-habit forming remedies'],
      glyph: 'orbital-cross',
    },
    {
      id: 'skin-wellness',
      number: '05',
      title: 'Skin & Dermatological Care',
      subtitle: 'Skin harmony & sensitivity',
      category: 'Dermatological Support',
      durationInitial: '45–60 min',
      durationReview: '20–30 min',
      description:
        'Consultation for chronic skin flare-ups, environmental triggers, and skin comfort through natural internal therapeutics.',
      focusAreas: ['Consultation for recurring skin flare-ups', 'Assessment of weather and environmental triggers', 'Gentle internal therapeutic approach'],
      glyph: 'crescent',
    },
    {
      id: 'digestive-health',
      number: '06',
      title: 'Digestive & Metabolic Rhythm',
      subtitle: 'Gut harmony & metabolism',
      category: 'Metabolic Balance',
      durationInitial: '45–60 min',
      durationReview: '20–30 min',
      description:
        'Consultation for recurring gastric discomfort, irregular motility, bloating patterns, and dietary sensitivities.',
      focusAreas: ['Digestive pattern analysis', 'Dietary sensitivity review', 'Restorative homeopathic guidance'],
      glyph: 'semi-stacked',
    },
  ],
};
