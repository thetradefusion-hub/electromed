import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MedicineExplanation {
  medicineName: string;
  why: string;
  howToUse: string;
  potency: string;
  precautions: string;
  benefits: string[];
}

interface MedicineInput {
  name: string;
  category: string;
  indications: string | null;
  dosage: string;
  duration: string;
}

interface SymptomInput {
  name: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

interface ExplainMedicinesResponse {
  explanations: MedicineExplanation[];
}

export const useAIMedicineExplainer = () => {
  const [explanations, setExplanations] = useState<MedicineExplanation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explainMedicines = async (
    medicines: MedicineInput[],
    symptoms: SymptomInput[]
  ): Promise<MedicineExplanation[]> => {
    if (medicines.length === 0) {
      toast.error('कोई दवा नहीं मिली');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<ExplainMedicinesResponse>(
        'explain-medicines',
        {
          body: { medicines, symptoms }
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data || !data.explanations) {
        throw new Error('Invalid response from AI');
      }

      setExplanations(data.explanations);
      toast.success('AI ने दवाओं की जानकारी तैयार कर दी है');
      return data.explanations;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI से जानकारी प्राप्त करने में त्रुटि';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('बहुत सारे request हो गए, कृपया थोड़ी देर बाद कोशिश करें');
      } else if (message.includes('Payment required')) {
        toast.error('AI credits समाप्त हो गए हैं');
      } else {
        toast.error(message);
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearExplanations = () => {
    setExplanations([]);
    setError(null);
  };

  return {
    explanations,
    isLoading,
    error,
    explainMedicines,
    clearExplanations,
  };
};
