'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { CLINIC_INFO } from '@/lib/constants';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const text = `Hello VSHMA,\n\nInquiry from website:\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email || 'Not provided'}\nMessage: ${formData.message}`;
      window.open(
        `${CLINIC_INFO.whatsappUrl}?text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener,noreferrer'
      );
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-[#FAF9F4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Connect with VSHMA"
          subtitle="Direct consultation inquiries, directions to clinic, or questions for Dr. Chihnitha Reddy T."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-14 items-start">
          {/* Clinic Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-sage/20 shadow-md space-y-6">
              <h3 className="font-heading text-2xl font-bold text-forest">
                Clinic Location &amp; Hours
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest">Consultation Clinic</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{CLINIC_INFO.location}</p>
                    <p className="text-[11px] text-sage font-medium mt-1">
                      * Complete street map coordinates provided on booking confirmation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest">WhatsApp / Call</h4>
                    <a
                      href={CLINIC_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-forest font-semibold hover:text-sage transition-colors block mt-0.5"
                    >
                      +91 {CLINIC_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest">Email Inquiries</h4>
                    <a
                      href={`mailto:${CLINIC_INFO.email}`}
                      className="text-sm text-forest font-medium hover:underline block mt-0.5"
                    >
                      {CLINIC_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest">Consultations</h4>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Monday to Saturday &bull; Prior Appointment Only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Quick Contact Card */}
            <div className="rounded-[2.5rem] bg-gradient-to-br from-forest to-forest-light text-white p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <span className="text-xs uppercase tracking-widest text-gold font-bold">
                  Instant Support
                </span>
                <h4 className="font-heading text-2xl font-bold text-white">
                  Prefer directly chatting on WhatsApp?
                </h4>
                <p className="text-sage-light text-xs sm:text-sm font-light">
                  Skip the web form and start a direct conversation with clinic staff right away.
                </p>
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block pt-1"
                >
                  <Button className="bg-[#25D366] hover:bg-[#20ba5a] text-white border-none shadow-lg flex items-center justify-center gap-2">
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>WhatsApp Us Now</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-sage/20 shadow-md">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-forest mb-2">
              Send a General Inquiry
            </h3>
            <p className="text-sm text-gray-600 mb-8 font-light">
              Have questions about constitutional evaluation, remedies, or online appointments? Drop us a note below.
            </p>

            {status === 'success' ? (
              <div className="p-8 rounded-3xl bg-mint text-forest text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 mx-auto text-forest" />
                <h4 className="font-heading font-bold text-2xl">Message Ready on WhatsApp!</h4>
                <p className="text-sm text-gray-700 max-w-md mx-auto">
                  Your inquiry message has opened in WhatsApp for instant direct messaging.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setStatus('idle')}>
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-2xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-2xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Your Message or Query <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="How can VSHMA assist you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="rounded-2xl"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>Send via WhatsApp</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
