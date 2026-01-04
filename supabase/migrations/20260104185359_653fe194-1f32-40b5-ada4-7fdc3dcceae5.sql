-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_no TEXT NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  symptoms JSONB NOT NULL DEFAULT '[]',
  medicines JSONB NOT NULL DEFAULT '[]',
  diagnosis TEXT,
  advice TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own prescriptions
CREATE POLICY "Doctors can manage their own prescriptions"
ON public.prescriptions
FOR ALL
USING (doctor_id IN (
  SELECT id FROM doctors WHERE user_id = auth.uid()
))
WITH CHECK (doctor_id IN (
  SELECT id FROM doctors WHERE user_id = auth.uid()
));

-- Super admins can view all prescriptions
CREATE POLICY "Super admins can view all prescriptions"
ON public.prescriptions
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_created ON public.prescriptions(created_at DESC);