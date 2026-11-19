'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { CONSULTATION_TYPES, TIME_SLOTS, CLINIC_INFO } from '@/lib/constants';
import { getTodayISO } from '@/lib/utils';
import Link from 'next/link';

export default function BookingSection() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    appointment_date: '',
    preferred_time: '',
    consultation_type: CONSULTATION_TYPES[0] as string,
    message: '',
    privacy_consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    reference: string;
    whatsappUrl: string;
  } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required.';

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Preferred appointment date is required.';
    } else {
      const selected = new Date(formData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.appointment_date = 'Date cannot be in the past.';
      }
    }

    if (!formData.privacy_consent) {
      newErrors.privacy_consent = 'Please agree to the privacy policy to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit appointment request.');
      }

      setBookingSuccess({
        reference: data.booking_reference,
        whatsappUrl: data.whatsapp_url,
      });

      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="book" className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Schedule a Consultation"
          subtitle="Request an appointment with Dr. Chihnitha Reddy T. Instant reference generation with WhatsApp pre-fill."
        />

        <div className="mt-12 rounded-[2.5rem] bg-[#FAF9F4] border border-sage/30 p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

          {bookingSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6"
            >
              <div className="w-20 h-20 bg-mint text-forest rounded-3xl flex items-center justify-center mx-auto shadow-md border-2 border-forest/15">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-3xl font-bold text-forest">
                  Booking Reference Created!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                  Your appointment slot request has been recorded securely in the clinic system.
                </p>
              </div>

              <div className="inline-block bg-white border border-sage/30 rounded-3xl px-8 py-5 shadow-sm">
                <span className="text-[11px] uppercase tracking-widest text-sage font-bold block mb-1">
                  Official Booking Reference
                </span>
                <span className="font-heading text-3xl font-bold text-forest tracking-wider">
                  {bookingSuccess.reference}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl p-5 max-w-md mx-auto text-left text-xs sm:text-sm text-gray-700 flex items-start gap-3">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <p>
                  <strong>Final step:</strong> Complete sending your pre-filled WhatsApp message to{' '}
                  <strong className="text-forest">+91 {CLINIC_INFO.phone}</strong> for clinic confirmation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href={bookingSuccess.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white border-none shadow-lg flex items-center justify-center gap-2">
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Open WhatsApp Pre-filled Chat</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-80" />
                  </Button>
                </a>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setBookingSuccess(null);
                    setFormData({
                      full_name: '',
                      phone: '',
                      appointment_date: '',
                      preferred_time: '',
                      consultation_type: CONSULTATION_TYPES[0] as string,
                      message: '',
                      privacy_consent: false,
                    });
                  }}
                >
                  Book Another Appointment
                </Button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {errors.form && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="e.g. Anand Sharma"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-11 rounded-2xl"
                      error={errors.full_name}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="10-digit number (e.g. 9876543210)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-11 rounded-2xl"
                      error={errors.phone}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      min={getTodayISO()}
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      className="pl-11 rounded-2xl"
                      error={errors.appointment_date}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Preferred Time Window
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Select
                      options={TIME_SLOTS.map((t) => ({ label: t.label, value: t.value }))}
                      placeholder="Choose a convenient time"
                      value={formData.preferred_time}
                      onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                      className="pl-11 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Consultation Type
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Select
                    options={CONSULTATION_TYPES.map((c) => ({ label: c, value: c }))}
                    value={formData.consultation_type}
                    onChange={(e) => setFormData({ ...formData, consultation_type: e.target.value })}
                    className="pl-11 rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder="Share any special timing preferences or preliminary requests (do not submit sensitive health history here)..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="rounded-2xl"
                />
              </div>

              {/* Privacy consent checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacy_consent}
                    onChange={(e) => setFormData({ ...formData, privacy_consent: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to allow VSHMA to store this contact information for booking purposes in compliance with the{' '}
                    <Link href="/privacy" className="text-forest font-semibold underline underline-offset-2" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.privacy_consent && (
                  <p className="text-xs text-red-500 mt-1">{errors.privacy_consent}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full py-4 text-base font-semibold shadow-xl hover:shadow-2xl"
                >
                  {isLoading ? 'Reserving Booking...' : 'Submit Booking & Open WhatsApp'}
                </Button>
                <p className="text-center text-xs text-gray-400 mt-3 font-light">
                  Your reference ID will be generated and WhatsApp will open to +91 {CLINIC_INFO.phone}.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
