import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ScrollToTop from '@/components/layout/ScrollToTop';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ConsultationOptionsSection from '@/components/sections/ConsultationOptionsSection';
import OurApproachSection from '@/components/sections/OurApproachSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import BookingSection from '@/components/sections/BookingSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] text-charcoal selection:bg-sage/20 selection:text-forest">
      <Navbar />
      <main className="flex-1">
        {/* 01. Premium Hero */}
        <HeroSection />

        {/* 02. Doctor Introduction */}
        <AboutSection />

        {/* 03. Our Clinical Approach */}
        <OurApproachSection />

        {/* 04. Consultation Options (Vertical Scroll Drives Horizontal Card Glide) */}
        <ConsultationOptionsSection />

        {/* 05. Why VSHMA & Personal Attention */}
        <WhyChooseSection />

        {/* 06. The Consultation Journey */}
        <HowItWorksSection />

        {/* 07. Appointment Booking Experience */}
        <BookingSection />

        {/* 08. Frequently Asked Questions */}
        <FAQSection />

        {/* 09. Contact and Clinic Information */}
        <CTASection />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
