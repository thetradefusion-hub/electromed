import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  indications: string | null;
  default_dosage: string | null;
  contra_indications: string | null;
  notes: string | null;
  is_global: boolean;
  doctor_id: string | null;
}

export const useMedicines = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching medicines:', error);
      } else {
        setMedicines(data || []);
      }
      setLoading(false);
    };

    fetchMedicines();
  }, [user]);

  return { medicines, loading };
};
