import HeroSection from '@/components/sections/HeroSection';
import OurApproachSection from '@/components/sections/OurApproachSection';
import ConsultationsSection from '@/components/sections/ConsultationsSection';
import AboutSection from '@/components/sections/AboutSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import BookingSection from '@/components/sections/BookingSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      {/* 01. Framed Hero */}
      <HeroSection />

      {/* 02. Our Clinical Approach (2x2 SageCard Grid) */}
      <OurApproachSection />

      {/* 03. Consultations 3D CoverFlow Carousel */}
      <ConsultationsSection />

      {/* 04. Doctor Profile & Authentic Architectural Portrait */}
      <AboutSection />

      {/* 05. The Consultation Journey (Unified Durations) */}
      <HowItWorksSection />

      {/* 06. Multi-Step Appointment Booking Experience */}
      <BookingSection />

      {/* 07. Frequently Asked Questions */}
      <FAQSection />

      {/* 08. Contact, Location Coordination & RingsMap */}
      <CTASection />
    </>
  );
}
