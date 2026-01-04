import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Symptom {
  id: string;
  name: string;
  category: string;
  description: string | null;
  is_global: boolean;
  doctor_id: string | null;
}

export const useSymptoms = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymptoms = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching symptoms:', error);
      } else {
        setSymptoms(data || []);
      }
      setLoading(false);
    };

    fetchSymptoms();
  }, [user]);

  return { symptoms, loading };
};
