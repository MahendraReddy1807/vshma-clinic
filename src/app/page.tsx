import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ScrollToTop from '@/components/layout/ScrollToTop';
import HeroSection from '@/components/sections/HeroSection';
import BrandIntroSection from '@/components/sections/BrandIntroSection';
import AboutSection from '@/components/sections/AboutSection';
import OurApproachSection from '@/components/sections/OurApproachSection';
import ConsultationExperiences from '@/components/sections/ConsultationExperiences';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import BookingSection from '@/components/sections/BookingSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-mint selection:text-forest">
      <Navbar />
      <main className="flex-1">
        {/* Section 01: Cinematic Hero */}
        <HeroSection />

        {/* Section 02: Brand Introduction */}
        <BrandIntroSection />

        {/* Section 03: Doctor Story */}
        <AboutSection />

        {/* Section 04: Our Approach */}
        <OurApproachSection />

        {/* Section 05: Consultation Experiences */}
        <ConsultationExperiences />

        {/* Section 06: The Consultation Journey */}
        <HowItWorksSection />

        {/* Section 07: Why VSHMA */}
        <WhyChooseSection />

        {/* Section 08: Premium Booking Experience */}
        <BookingSection />

        {/* Section 09: FAQ */}
        <FAQSection />

        {/* Section 10: Signature Closing Section */}
        <CTASection />
      </main>
      {/* Section 11: Premium Footer */}
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
