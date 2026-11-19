-- Tighten the initial schema: public writes go through the validated server API,
-- and database policies grant appointment access to admin profiles only.
DROP POLICY IF EXISTS "Public can submit appointment bookings" ON public.appointments;
DROP POLICY IF EXISTS "Authorized administrators can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authorized administrators can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authorized administrators can delete appointments" ON public.appointments;

CREATE POLICY "Administrators can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Administrators can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Administrators can delete appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Admins can view own admin profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND role = 'admin');

REVOKE ALL ON public.appointments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.appointments FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON public.appointments TO authenticated;
