-- Create patient_users table to link patients table with auth users
CREATE TABLE IF NOT EXISTS public.patient_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  mobile text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_users ENABLE ROW LEVEL SECURITY;

-- Patients can view their own record
CREATE POLICY "Patients can view their own record"
  ON public.patient_users FOR SELECT
  USING (auth.uid() = user_id);

-- Patients can update their own record
CREATE POLICY "Patients can update their own record"
  ON public.patient_users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Doctors and super admins can view patient users
CREATE POLICY "Doctors can view patient users"
  ON public.patient_users FOR SELECT
  USING (
    has_role(auth.uid(), 'doctor'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add RLS policy for patients to view their own prescriptions
CREATE POLICY "Patients can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN patient_users pu ON pu.patient_id = p.id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Add RLS policy for patients to view their own appointments
CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN patient_users pu ON pu.patient_id = p.id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Add RLS policy for patients to book appointments
CREATE POLICY "Patients can book appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'patient'::app_role)
  );

-- Add RLS policy for patients to view their own medical reports
CREATE POLICY "Patients can view their own medical reports"
  ON public.patient_medical_reports FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN patient_users pu ON pu.patient_id = p.id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Update handle_new_user function to handle patient registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from metadata or default to 'doctor'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'doctor'::app_role
  );
  
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If doctor, create doctors record
  IF user_role = 'doctor' THEN
    INSERT INTO public.doctors (user_id, registration_no, qualification, specialization)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'registration_no', ''),
      COALESCE(NEW.raw_user_meta_data->>'qualification', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'Electro Homoeopathy')
    );
  END IF;
  
  -- If patient, create patient_users record
  IF user_role = 'patient' THEN
    INSERT INTO public.patient_users (user_id, mobile)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_patient_users_updated_at
  BEFORE UPDATE ON public.patient_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();