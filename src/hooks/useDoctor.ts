import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DoctorInfo {
  id: string;
  name: string;
  clinicName: string | null;
  clinicAddress: string | null;
  qualification: string;
  registrationNo: string;
  specialization: string;
}

export function useDoctor() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: doctorData, error } = await supabase
          .from('doctors')
          .select('id, clinic_name, clinic_address, qualification, registration_no, specialization')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching doctor:', error);
          setLoading(false);
          return;
        }

        if (doctorData) {
          // Fetch profile for name
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', user.id)
            .maybeSingle();

          setDoctorId(doctorData.id);
          setDoctorInfo({
            id: doctorData.id,
            name: profileData?.name || 'Doctor',
            clinicName: doctorData.clinic_name,
            clinicAddress: doctorData.clinic_address,
            qualification: doctorData.qualification,
            registrationNo: doctorData.registration_no,
            specialization: doctorData.specialization,
          });
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [user]);

  return { doctorId, doctorInfo, loading };
}
