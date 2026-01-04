-- Create table for storing patient medical reports with analysis
CREATE TABLE public.patient_medical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patient_medical_reports ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own patient reports
CREATE POLICY "Doctors can manage their own patient reports"
ON public.patient_medical_reports
FOR ALL
USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Super admins can view all reports
CREATE POLICY "Super admins can view all reports"
ON public.patient_medical_reports
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patient_medical_reports_updated_at
BEFORE UPDATE ON public.patient_medical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_patient_medical_reports_patient_id ON public.patient_medical_reports(patient_id);
CREATE INDEX idx_patient_medical_reports_doctor_id ON public.patient_medical_reports(doctor_id);