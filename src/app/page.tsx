import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ScrollToTop from '@/components/layout/ScrollToTop';
import HeroSection from '@/components/sections/HeroSection';
import TrustBar from '@/components/sections/TrustBar';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import BookingSection from '@/components/sections/BookingSection';
import ContactSection from '@/components/sections/ContactSection';
import CTASection from '@/components/sections/CTASection';
import FAQSection from '@/components/sections/FAQSection';
import ReviewsSection from '@/components/sections/ReviewsSection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustBar />
        <AboutSection />
        <ServicesSection />
        <WhyChooseSection />
        <HowItWorksSection />
        <BookingSection />
        <ContactSection />
        <FAQSection />
        <CTASection />
        <ReviewsSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
