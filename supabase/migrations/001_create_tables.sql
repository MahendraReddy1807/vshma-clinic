-- ============================================================
-- VSHMA CLINIC DATABASE MIGRATION - 001
-- Description: Core tables, indexes, and Row Level Security
-- ============================================================

-- 1. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  preferred_time TEXT,
  consultation_type TEXT NOT NULL DEFAULT 'General Consultation',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Admin Profiles Table (references auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Optimal Query Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON public.appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_ref ON public.appointments(booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(phone);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Appointments RLS Policies
-- Allow public visitors (both anon and authenticated) to create appointment requests only
CREATE POLICY "Public can submit appointment bookings"
  ON public.appointments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authorized administrators to read all appointments
CREATE POLICY "Authorized administrators can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE public.admin_profiles.id = auth.uid()
    )
  );

-- Allow authorized administrators to modify appointments (e.g. status updates)
CREATE POLICY "Authorized administrators can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE public.admin_profiles.id = auth.uid()
    )
  );

-- Allow authorized administrators to remove appointment records
CREATE POLICY "Authorized administrators can delete appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE public.admin_profiles.id = auth.uid()
    )
  );

-- 6. Admin Profiles RLS Policies
CREATE POLICY "Admins can view own admin profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 7. Trigger for automated updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_appointment_updated ON public.appointments;
CREATE TRIGGER on_appointment_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
