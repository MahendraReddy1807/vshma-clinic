import type { NavLink, ServiceCard } from '@/types';

/* ───────────── Brand Colors ───────────── */
export const COLORS = {
  forestGreen: '#183D32',
  sage: '#8BA895',
  mint: '#E9F1EB',
  ivory: '#FAF9F4',
  white: '#FFFFFF',
  gold: '#B9A477',
} as const;

/* ───────────── Clinic Info ───────────── */
export const CLINIC_INFO = {
  name: 'VSHMA',
  fullName: 'VSHMA Homeopathy Clinic',
  doctor: 'Dr. Chihnitha Reddy T',
  qualification: 'BHMS',
  qualificationFull: 'Bachelor of Homeopathic Medicine and Surgery',
  tagline: 'Natural Care. Personal Attention.',
  city: 'Bengaluru',
  location: 'Bengaluru, Karnataka, India',
  /* Editable: replace with actual address when available */
  address: 'Bengaluru, Karnataka, India',
  phone: '7416001477',
  phoneFull: '+91 7416001477',
  whatsappNumber: '917416001477',
  whatsappUrl: 'https://wa.me/917416001477',
  /* Editable: replace with actual email */
  email: 'care@vshma.in',
} as const;

/* ───────────── Navigation ───────────── */
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Doctor', href: '/about' },
  { label: 'Our Approach', href: '/#our-approach' },
  { label: 'Consultations', href: '/treatments' },
  { label: 'Contact', href: '/contact' },
];

/* ───────────── Consultation Types (Aligned with 6 Specialties) ───────────── */
export const CONSULTATION_TYPES = [
  'General Consultation',
  'Ongoing & Follow-Up Care',
  'Pediatric & Family Wellness',
  "Women's Health & Hormonal Balance",
  'Dermatological & Skin Wellness',
  'Digestive & Metabolic Harmony',
] as const;

/* ───────────── Consultation Modes ───────────── */
export const CONSULTATION_MODES = [
  { label: 'In-Clinic Consultation (Bengaluru)', value: 'in_clinic' },
  { label: 'Virtual Video Consultation (Pan-India)', value: 'video' },
] as const;

/* ───────────── Time Slots (Covering Mon–Sat 9:00 AM – 7:00 PM) ───────────── */
export const TIME_SLOTS = [
  { label: 'Morning (9:00 AM – 12:00 PM)', value: 'Morning (9:00 AM – 12:00 PM)' },
  { label: 'Afternoon (12:00 PM – 3:30 PM)', value: 'Afternoon (12:00 PM – 3:30 PM)' },
  { label: 'Evening (3:30 PM – 7:00 PM)', value: 'Evening (3:30 PM – 7:00 PM)' },
] as const;

/* ───────────── Services ───────────── */
export const SERVICES: ServiceCard[] = [
  {
    title: 'General Consultation',
    description:
      'Comprehensive evaluation of your health concerns with a personalised homeopathic approach tailored to your individual needs.',
    icon: 'Stethoscope',
  },
  {
    title: 'Ongoing Consultations',
    description:
      'Follow-up consultations provide an opportunity to discuss your care and next steps with the practitioner.',
    icon: 'HeartPulse',
  },
  {
    title: 'Pediatric Homeopathy',
    description:
      'Consultations for children, with a parent or guardian involved in the conversation and care decisions.',
    icon: 'Baby',
  },
  {
    title: "Women's Health",
    description:
      'A private consultation to discuss individual concerns and decide on appropriate next steps with the practitioner.',
    icon: 'Flower2',
  },
  {
    title: 'Skin & Hair Care',
    description:
      'Discuss skin or hair concerns in a consultation and receive guidance on appropriate care.',
    icon: 'Sparkles',
  },
  {
    title: 'Digestive Health',
    description:
      'Discuss digestive concerns with the practitioner and decide on appropriate next steps.',
    icon: 'Apple',
  },
];

/* ───────────── Why Choose VSHMA ───────────── */
export const WHY_CHOOSE = [
  {
    title: 'Individual Attention',
    description:
      'Use your consultation to share the concerns you would like to discuss with the practitioner.',
    icon: 'UserCheck',
  },
  {
    title: 'Patient-Focused Consultations',
    description:
      'Consultations are an opportunity to discuss your questions and preferences directly with the practitioner.',
    icon: 'Heart',
  },
  {
    title: 'Welcoming Environment',
    description:
      'Contact the clinic to confirm the consultation format and location details before your visit.',
    icon: 'Home',
  },
  {
    title: 'Clear Communication',
    description:
      'Ask questions about the consultation process and next steps when you connect with the clinic.',
    icon: 'MessageCircle',
  },
  {
    title: 'Follow-up Support',
    description:
      'Ask the practitioner about follow-up options during your consultation.',
    icon: 'PhoneCall',
  },
];

/* ───────────── How It Works Steps ───────────── */
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Book a Consultation',
    description: 'Fill out our simple booking form or reach out via WhatsApp to schedule your appointment.',
    icon: 'CalendarCheck',
  },
  {
    step: 2,
    title: 'Connect with the Clinic',
    description: 'Our team confirms your appointment and answers any preliminary questions you may have.',
    icon: 'Phone',
  },
  {
    step: 3,
    title: 'Consult with the Doctor',
    description: 'Meet Dr. Chihnitha Reddy T for a thorough, personalised consultation and begin your wellness journey.',
    icon: 'Stethoscope',
  },
];
