'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { CONSULTATION_TYPES, TIME_SLOTS, CLINIC_INFO } from '@/lib/constants';
import { getTodayISO } from '@/lib/utils';
import Link from 'next/link';

interface BookingSectionProps {
  initialType?: string;
}

export default function BookingSection({ initialType }: BookingSectionProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    age: '',
    appointment_date: '',
    preferred_time: '',
    consultation_type: initialType || (CONSULTATION_TYPES[0] as string),
    message: '',
    privacy_consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    reference: string;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryType = params.get('type');
      if (queryType && (CONSULTATION_TYPES as readonly string[]).includes(queryType)) {
        setTimeout(() => {
          setFormData((prev) => ({ ...prev, consultation_type: queryType }));
        }, 0);
      }
    }
  }, []);

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
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required.';
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Preferred appointment date is required.';
    } else if (formData.appointment_date < getTodayISO()) {
      newErrors.appointment_date = 'Date cannot be in the past.';
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

      // Attempt window open if not blocked
      if (data.whatsapp_url) {
        try {
          window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer');
        } catch {
          // Handled via prominent manual button in success view
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="book" className="py-24 lg:py-32 bg-white relative scroll-mt-24">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-widest uppercase font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Consultation Reservation</span>
          </div>

          <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
            Schedule a Consultation
          </h2>

          <p className="text-charcoal/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            Request your appointment with Dr. Chihnitha Reddy T (BHMS). Receive an instant booking reference and pre-filled WhatsApp confirmation.
          </p>
        </div>

        <div className="rounded-[2.5rem] bg-ivory border border-sage/30 p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

          {bookingSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center py-6 space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 text-forest rounded-3xl flex items-center justify-center mx-auto shadow-md border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-700" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-3xl sm:text-4xl font-normal text-forest">
                  Booking Request Recorded
                </h3>
                <p className="text-charcoal/75 max-w-md mx-auto text-sm sm:text-base font-light">
                  Your appointment slot request has been logged in the VSHMA clinical system.
                </p>
              </div>

              <div className="inline-block bg-white border border-sage/30 rounded-3xl px-8 py-5 shadow-sm">
                <span className="text-[11px] uppercase tracking-widest text-gold font-bold block mb-1">
                  Official Booking Reference
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-forest tracking-wider">
                  {bookingSuccess.reference}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl p-5 max-w-md mx-auto text-left text-xs sm:text-sm text-charcoal/80 flex items-start gap-3.5 shadow-sm">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <p>
                  <strong>Final step:</strong> Click the button below to send your pre-filled confirmation message directly to Dr. Chihnitha on WhatsApp (+91 {CLINIC_INFO.phone}).
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
                      email: '',
                      age: '',
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
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
              <div className="p-4 rounded-xl bg-[#F6F2E9] border border-[#D8D0BD] text-xs text-charcoal/80 flex items-start gap-3">
                <Clock className="w-4 h-4 text-bronze shrink-0 mt-0.5" />
                <p>
                  <strong>Appointment Policy:</strong> This form registers an appointment request. Our clinic desk will review the slot and confirm your scheduled consultation directly with you.
                </p>
              </div>

              {errors.form && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="booking-fullname"
                    className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                  >
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="booking-fullname"
                      placeholder="e.g. Anand Sharma"
                      value={formData.full_name}
                      onChange={(e) => {
                        setFormData({ ...formData, full_name: e.target.value });
                        clearFieldError('full_name');
                      }}
                      className="pl-11 rounded-2xl"
                      error={errors.full_name}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                  >
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="booking-phone"
                      type="tel"
                      placeholder="10-digit number (e.g. 9876543210)"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        clearFieldError('phone');
                      }}
                      className="pl-11 rounded-2xl"
                      error={errors.phone}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-email"
                    className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                  >
                    Email Address (For Confirmation &amp; Reminders)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="booking-email"
                      type="email"
                      placeholder="e.g. yourname@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        clearFieldError('email');
                      }}
                      className="pl-11 rounded-2xl"
                      error={errors.email}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-age"
                    className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                  >
                    Patient Age
                  </label>
                  <Input
                    id="booking-age"
                    type="number"
                    min={0}
                    max={120}
                    placeholder="e.g. 32"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                  >
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="booking-date"
                      type="date"
                      min={getTodayISO()}
                      value={formData.appointment_date}
                      onChange={(e) => {
                        setFormData({ ...formData, appointment_date: e.target.value });
                        clearFieldError('appointment_date');
                      }}
                      className="pl-11 rounded-2xl"
                      error={errors.appointment_date}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-time"
                    className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                  >
                    Preferred Time Window
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <Select
                      id="booking-time"
                      options={TIME_SLOTS.map((t) => ({ label: t.label, value: t.value }))}
                      placeholder="Choose a convenient time"
                      value={formData.preferred_time}
                      onChange={(e) => {
                        setFormData({ ...formData, preferred_time: e.target.value });
                        clearFieldError('preferred_time');
                      }}
                      className="pl-11 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-type"
                  className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                >
                  Consultation Type
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Select
                    id="booking-type"
                    options={CONSULTATION_TYPES.map((c) => ({ label: c, value: c }))}
                    value={formData.consultation_type}
                    onChange={(e) => {
                      setFormData({ ...formData, consultation_type: e.target.value });
                      clearFieldError('consultation_type');
                    }}
                    className="pl-11 rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-message"
                  className="block text-xs font-bold text-forest uppercase tracking-wider mb-2 font-sans"
                >
                  Additional Information (Optional)
                </label>
                <Textarea
                  id="booking-message"
                  placeholder="Share any special timing requests or general questions..."
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
                    onChange={(e) => {
                      setFormData({ ...formData, privacy_consent: e.target.checked });
                      clearFieldError('privacy_consent');
                    }}
                    className="mt-1 h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                  />
                  <span className="text-xs text-charcoal/70 leading-relaxed font-sans">
                    I agree to allow VSHMA to store this contact information for booking and appointment coordination in compliance with the{' '}
                    <Link href="/privacy" className="text-forest font-semibold underline underline-offset-2" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.privacy_consent && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{errors.privacy_consent}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full py-4 text-base font-semibold shadow-xl hover:shadow-2xl font-sans"
                >
                  {isLoading ? 'Recording Reservation...' : 'Submit Booking & Open WhatsApp'}
                </Button>
                <div className="flex items-center justify-center gap-2 text-center text-xs text-charcoal/50 mt-3 font-light font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                  <span>Your booking reference will be generated and verified securely.</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
