'use client';

import { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { CLINIC_INFO } from '@/lib/constants';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Please enter your mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a brief message or question.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const text = `Hello Dr. Chihnitha / VSHMA Clinic,\n\nName: ${formData.name}\nPhone: ${formData.phone}\nInquiry: ${formData.message}`;
    const url = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
    setWhatsappUrl(url);
    setSubmitted(true);

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // Manual fallback button available
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-ivory text-charcoal" aria-label="Contact VSHMA Clinic">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Clinic Coordinates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold block font-sans">
                Get in Touch
              </span>
              <h1 className="font-display font-light text-4xl sm:text-5xl text-forest leading-tight">
                Connect with VSHMA
              </h1>
              <p className="text-charcoal/75 text-base leading-relaxed font-light font-sans">
                We are here to answer your questions regarding appointment availability, consultation formats, and clinical care.
              </p>
            </div>

            {/* Clinic Info Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-sage/25 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-forest text-base">Location</p>
                    <p className="text-xs sm:text-sm text-charcoal/75 mt-0.5">{CLINIC_INFO.location}</p>
                    <p className="text-[11px] text-sage-dark font-medium mt-1">In-Clinic &amp; Virtual Consultations</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-sage/15">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
                    <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-forest text-base">WhatsApp Hotline</p>
                    <a
                      href={CLINIC_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 mt-0.5 block"
                    >
                      +91 {CLINIC_INFO.phone}
                    </a>
                    <p className="text-[11px] text-charcoal/65 mt-0.5">Quick responses during clinical hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-sage/15">
                  <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-forest text-base">Email</p>
                    <a
                      href={`mailto:${CLINIC_INFO.email}`}
                      className="text-xs sm:text-sm text-charcoal/80 hover:text-forest underline underline-offset-2 mt-0.5 block"
                    >
                      {CLINIC_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-sage/15">
                  <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-forest text-base">Clinical Hours</p>
                    <p className="text-xs sm:text-sm text-charcoal/75 mt-0.5">
                      Monday &ndash; Saturday &bull; By Prior Appointment
                    </p>
                    <p className="text-[11px] text-charcoal/65 mt-0.5">Sunday closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Inquiry Message Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white border border-sage/30 shadow-xl relative overflow-hidden">
              <div className="space-y-3 mb-8">
                <h2 className="font-display text-2xl sm:text-3xl text-forest font-normal">
                  Send a Message to the Clinic
                </h2>
                <p className="text-xs sm:text-sm text-charcoal/75 font-light leading-relaxed">
                  Fill in your details below and your message will open directly in WhatsApp for Dr. Chihnitha and her team.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-normal text-forest">
                      Message Prepared for WhatsApp
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal/75 max-w-sm mx-auto font-light leading-relaxed">
                      If WhatsApp did not open automatically, click the button below to connect with Dr. Chihnitha.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold tracking-wide shadow-md font-sans"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white" />
                      <span>Open in WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', phone: '', message: '' });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="contact-name"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        clearFieldError('name');
                      }}
                      className="rounded-2xl"
                      error={errors.name}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        clearFieldError('phone');
                      }}
                      className="rounded-2xl"
                      error={errors.phone}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                    >
                      Your Question or Inquiry <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="contact-message"
                      placeholder="Ask about consultation slots, virtual consultation options, or general clinic inquiries..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        clearFieldError('message');
                      }}
                      rows={4}
                      className="rounded-2xl"
                      error={errors.message}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full py-4 text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl font-sans"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>Send Inquiry to Clinic WhatsApp</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
