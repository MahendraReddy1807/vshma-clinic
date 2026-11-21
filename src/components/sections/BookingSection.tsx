'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Video,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { CONSULTATION_TYPES, TIME_SLOTS } from '@/lib/constants';
import { getTodayISO } from '@/lib/utils';
import SectionTag from '@/components/ui/luxury/SectionTag';
import Link from 'next/link';
import BookingSuccessModal from '@/components/booking/BookingSuccessModal';

interface BookingSectionProps {
  initialType?: string;
}

const STEP_TITLES = [
  'Specialty',
  'Visit Mode',
  'Date & Time',
  'Patient Details',
  'Review & Consent',
];

export default function BookingSection({ initialType }: BookingSectionProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState<{
    full_name: string;
    phone: string;
    email: string;
    age: string;
    appointment_date: string;
    preferred_time: string;
    consultation_type: string;
    consultation_mode: 'in_clinic' | 'video';
    message: string;
    privacy_consent: boolean;
    whatsapp_opt_in: boolean;
  }>({
    full_name: '',
    phone: '',
    email: '',
    age: '',
    appointment_date: '',
    preferred_time: (TIME_SLOTS[0]?.value || 'Morning (9:00 AM – 12:00 PM)') as string,
    consultation_type: initialType || (CONSULTATION_TYPES[0] as string),
    consultation_mode: 'in_clinic',
    message: '',
    privacy_consent: false,
    whatsapp_opt_in: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    reference: string;
    whatsappUrl: string;
    fullName?: string;
    phone?: string;
    date?: string;
    time?: string;
    type?: string;
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

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 3) {
      if (!formData.appointment_date) {
        newErrors.appointment_date = 'Preferred appointment date is required.';
      } else if (formData.appointment_date < getTodayISO()) {
        newErrors.appointment_date = 'Date cannot be in the past.';
      }
    }

    if (currentStep === 4) {
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
    }

    if (currentStep === 5) {
      if (!formData.privacy_consent) {
        newErrors.privacy_consent = 'Please agree to the privacy policy to proceed.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const formattedType = `${formData.consultation_type} [${formData.consultation_mode === 'video' ? 'Virtual Video' : 'In-Clinic'}]`;
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          consultation_type: formattedType,
          whatsapp_opt_in: Boolean(formData.whatsapp_opt_in),
          whatsapp_opt_in_timestamp: formData.whatsapp_opt_in ? new Date().toISOString() : null,
          whatsapp_opt_in_source: 'web_booking_form',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit appointment request.');
      }

      setBookingSuccess({
        reference: data.booking_reference,
        whatsappUrl: data.whatsapp_url,
        fullName: formData.full_name,
        phone: formData.phone,
        date: formData.appointment_date,
        time: formData.preferred_time,
        type: formData.consultation_type,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="book" data-nav-theme="light" className="py-10 lg:py-16 bg-[#F7F3EC] relative scroll-mt-[var(--nav-h)] border-t border-[#D8D0BD]/40">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10 sm:mb-14">
          <SectionTag>Consultation Reservation</SectionTag>

          <h2 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl text-[#121A15] leading-[1.08] tracking-tight">
            Schedule a Consultation
          </h2>

          <p className="text-[#161815]/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            Request an unhurried consultation with Dr. Chihnitha Reddy T (BHMS). Receive an instant booking reference and automated concierge confirmation.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-[28px] bg-white border border-[#D8D0BD]/70 p-6 sm:p-12 shadow-xl relative overflow-hidden">

          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B89B5E]/10 rounded-full blur-[100px] pointer-events-none" />

          {bookingSuccess && (
            <BookingSuccessModal
              data={{
                reference: bookingSuccess.reference,
                fullName: bookingSuccess.fullName || formData.full_name,
                phone: bookingSuccess.phone || formData.phone,
                date: bookingSuccess.date || formData.appointment_date,
                time: bookingSuccess.time || formData.preferred_time,
                type: bookingSuccess.type || formData.consultation_type,
                mode: formData.consultation_mode === 'video' ? 'Virtual Video Call' : 'In-Clinic (Bengaluru)',
                whatsappUrl: bookingSuccess.whatsappUrl,
              }}
              onClose={() => {
                setBookingSuccess(null);
                setStep(1);
                setFormData({
                  full_name: '',
                  phone: '',
                  email: '',
                  age: '',
                  appointment_date: '',
                  preferred_time: TIME_SLOTS[0]?.value || 'Morning (9:00 AM – 12:00 PM)',
                  consultation_type: CONSULTATION_TYPES[0] as string,
                  consultation_mode: 'in_clinic',
                  message: '',
                  privacy_consent: false,
                  whatsapp_opt_in: true,
                });
              }}
            />
          )}

          {bookingSuccess ? (
            /* ───────────── STEP 6: ANIMATED CONFIRMATION & CLOSING CIRCLE ───────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center py-6 space-y-7"
            >
              {/* Signature Half-Circle Mark Completing into a Full Circle */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Left Semi */}
                <motion.div
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                  className="w-10 h-20 rounded-l-full bg-gradient-to-r from-[#D4D8BA] to-[#B89B5E] shadow-md"
                />
                {/* Right Semi */}
                <motion.div
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                  className="w-10 h-20 rounded-r-full bg-gradient-to-l from-[#D4D8BA] to-[#B89B5E] shadow-md"
                />
                {/* Center Success Check */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 20 }}
                  className="absolute w-8 h-8 rounded-full bg-[#121A15] text-[#FAF8F2] flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#B89B5E]" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#B89B5E] font-sans">
                  Appointment Request Confirmed
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#121A15]">
                  Your consultation request is registered.
                </h3>
                <p className="text-[#161815]/75 max-w-md mx-auto text-sm sm:text-base font-light font-sans">
                  The clinical desk has received your details. No further action is required from you.
                </p>
              </div>

              {/* Official Booking Reference Card */}
              <div className="inline-block bg-[#F7F3EC] border border-[#D8D0BD] rounded-3xl px-8 py-5 shadow-sm">
                <span className="text-[11px] uppercase tracking-widest text-[#B89B5E] font-bold block mb-1 font-sans">
                  Official Booking Reference
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#121A15] tracking-widest">
                  {bookingSuccess.reference}
                </span>
              </div>

              {/* Automated Next Steps Card */}
              <div className="bg-[#FAF8F2] border border-[#D8D0BD] rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#121A15] font-sans block">
                  Next Steps:
                </span>
                <ul className="space-y-2 text-xs sm:text-sm text-[#161815]/80 font-sans">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Slot Reserved:</strong> Your requested window ({bookingSuccess.date || 'Requested date'} &bull; {bookingSuccess.time || 'Preferred time'}) is recorded in the clinical scheduler.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Concierge Review:</strong> Dr. Chihnitha&apos;s team will verify slot availability and dispatch your consultation voucher.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#121A15] hover:bg-[#1F2B23] text-white shadow-md rounded-full px-8 py-3.5"
                  onClick={() => {
                    setBookingSuccess(null);
                    setStep(1);
                    setFormData({
                      full_name: '',
                      phone: '',
                      email: '',
                      age: '',
                      appointment_date: '',
                      preferred_time: TIME_SLOTS[0]?.value || 'Morning (9:00 AM – 12:00 PM)',
                      consultation_type: CONSULTATION_TYPES[0] as string,
                      consultation_mode: 'in_clinic',
                      message: '',
                      privacy_consent: false,
                      whatsapp_opt_in: true,
                    });
                  }}
                >
                  Book Another Consultation
                </Button>

                <a
                  href={bookingSuccess.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#161815]/80 hover:text-[#121A15] transition-colors py-2 px-3 font-sans"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>Open WhatsApp Concierge</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </motion.div>
          ) : (
            /* ───────────── MULTI-STEP BOOKING WORKFLOW ───────────── */
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>

              {/* Step Progress Bar */}
              <div className="space-y-3 pb-6 border-b border-[#D8D0BD]/50">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-[#121A15] uppercase tracking-wider">
                    Step 0{step} of 05 &mdash; {STEP_TITLES[step - 1]}
                  </span>
                  <span className="text-[#161815]/60 font-mono">
                    {Math.round((step / 5) * 100)}% Complete
                  </span>
                </div>
                {/* Horizontal progress track */}
                <div className="w-full h-1.5 rounded-full bg-[#E3E4DC] overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#D4D8BA] to-[#B89B5E]"
                    initial={{ width: '20%' }}
                    animate={{ width: `${(step / 5) * 100}%` }}
                    transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                </div>
              </div>

              {errors.form && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Progressive Step Views */}
              <AnimatePresence mode="wait">
                {/* STEP 1: Specialty Selection */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-1">
                      Choose Your Consultation Specialty
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {CONSULTATION_TYPES.map((type) => {
                        const isSelected = formData.consultation_type === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, consultation_type: type });
                              clearFieldError('consultation_type');
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all ${isSelected
                              ? 'bg-[#121A15] text-[#FAF8F2] border-[#B89B5E] shadow-md'
                              : 'bg-[#FAF8F2] text-[#161815] border-[#D8D0BD]/70 hover:border-[#121A15]/40'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-lg">{type}</span>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-[#B89B5E] shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Visit Mode */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-1">
                      Select Preferred Consultation Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, consultation_mode: 'in_clinic' })}
                        className={`p-6 rounded-2xl border text-left transition-all space-y-3 ${formData.consultation_mode === 'in_clinic'
                          ? 'bg-[#121A15] text-[#FAF8F2] border-[#B89B5E] shadow-md'
                          : 'bg-[#FAF8F2] text-[#161815] border-[#D8D0BD]/70 hover:border-[#121A15]/40'
                          }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#B89B5E]" />
                        </div>
                        <div>
                          <p className="font-serif text-xl">In-Clinic Visit</p>
                          <p className="text-xs opacity-75 font-sans mt-0.5">Bengaluru Practice &bull; Face-to-Face Examination</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, consultation_mode: 'video' })}
                        className={`p-6 rounded-2xl border text-left transition-all space-y-3 ${formData.consultation_mode === 'video'
                          ? 'bg-[#121A15] text-[#FAF8F2] border-[#B89B5E] shadow-md'
                          : 'bg-[#FAF8F2] text-[#161815] border-[#D8D0BD]/70 hover:border-[#121A15]/40'
                          }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-[#B89B5E]" />
                        </div>
                        <div>
                          <p className="font-serif text-xl">Virtual Video Consultation</p>
                          <p className="text-xs opacity-75 font-sans mt-0.5">Pan-India &bull; Secure Encrypted Session</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Date & Preferred Time */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        <Input
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
                      <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                        Preferred Time Window (Operating Hours 9:00 AM – 7:00 PM)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {TIME_SLOTS.map((slot) => {
                          const isSelected = formData.preferred_time === slot.value;
                          return (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, preferred_time: slot.value })}
                              className={`p-3.5 rounded-2xl border text-center transition-all ${isSelected
                                ? 'bg-[#121A15] text-[#FAF8F2] border-[#B89B5E] shadow-sm font-medium'
                                : 'bg-[#FAF8F2] text-[#161815] border-[#D8D0BD]/70 hover:border-[#121A15]/40'
                                }`}
                            >
                              <span className="block text-xs font-sans">{slot.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Patient Details */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                          Patient Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <Input
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
                        <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                          Mobile Number (10 Digits) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <Input
                            type="tel"
                            placeholder="e.g. 9876543210"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                          Email (For Schedule Voucher)
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="e.g. anand@example.com"
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
                        <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                          Patient Age
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g. 34"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="rounded-2xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121A15] uppercase tracking-wider font-sans mb-2">
                        Primary Health Concern (Optional)
                      </label>
                      <Textarea
                        rows={2}
                        placeholder="Briefly describe your symptoms or reason for consultation..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="rounded-2xl"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Review & DPDP Consent */}
                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Summary Card */}
                    <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#D8D0BD] space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89B5E] block font-sans">
                        Consultation Dossier Summary
                      </span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div>
                          <p className="text-[#161815]/60">Specialty</p>
                          <p className="font-semibold text-[#121A15]">{formData.consultation_type}</p>
                        </div>
                        <div>
                          <p className="text-[#161815]/60">Visit Mode</p>
                          <p className="font-semibold text-[#121A15]">
                            {formData.consultation_mode === 'video' ? 'Virtual Video Call' : 'In-Clinic (Bengaluru)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#161815]/60">Date &amp; Slot</p>
                          <p className="font-semibold text-[#121A15]">{formData.appointment_date} &bull; {formData.preferred_time}</p>
                        </div>
                        <div>
                          <p className="text-[#161815]/60">Patient</p>
                          <p className="font-semibold text-[#121A15]">{formData.full_name} ({formData.phone})</p>
                        </div>
                      </div>
                    </div>

                    {/* DPDP Act 2023 Consent Checkbox */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.privacy_consent}
                          onChange={(e) => {
                            setFormData({ ...formData, privacy_consent: e.target.checked });
                            clearFieldError('privacy_consent');
                          }}
                          className="mt-1 h-4 w-4 rounded border-[#D8D0BD] text-[#121A15] focus:ring-[#B89B5E] cursor-pointer"
                        />
                        <span className="text-xs text-[#161815]/80 leading-relaxed font-sans">
                          I consent to VSHMA Homeopathy Clinic storing my consultation request and health intake notes for appointment coordination in compliance with the Digital Personal Data Protection (DPDP) Act 2023 and the clinic&apos;s{' '}
                          <Link href="/privacy" className="underline font-semibold text-[#121A15]" target="_blank">
                            Privacy Policy
                          </Link>
                          . <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.privacy_consent && (
                        <p className="text-xs text-red-500 pl-7">{errors.privacy_consent}</p>
                      )}

                      {/* WhatsApp Opt-in */}
                      <label className="flex items-start gap-3 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={formData.whatsapp_opt_in}
                          onChange={(e) => setFormData({ ...formData, whatsapp_opt_in: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-[#D8D0BD] text-[#121A15] focus:ring-[#B89B5E] cursor-pointer"
                        />
                        <span className="text-xs text-[#161815]/80 leading-relaxed font-sans">
                          Send automated appointment confirmation and reminder updates via WhatsApp.
                        </span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-[#D8D0BD]/50">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D8D0BD] text-xs font-semibold text-[#161815] hover:bg-[#FAF8F2] transition-colors font-sans"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#121A15] text-[#FAF8F2] text-xs font-semibold hover:bg-[#1F2B23] transition-colors shadow-md font-sans"
                  >
                    <span>Continue to {STEP_TITLES[step]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#B89B5E] hover:bg-[#CEB57D] text-[#121A15] text-xs font-semibold transition-colors shadow-md font-sans disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Reserving Slot...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirm Consultation Reservation</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          )}

        </div>
      </div>
    </section>
  );
}
