import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SymptomExplanation {
  symptomName: string;
  medicalDefinition: string;
  pathophysiology: string;
  associatedConditions: string[];
  clinicalSignificance: string;
  differentialConsiderations: string;
}

interface SymptomInput {
  id: string;
  name: string;
  category: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

interface ExplainSymptomsResponse {
  explanations: SymptomExplanation[];
}

export const useAISymptomExplainer = () => {
  const [explanations, setExplanations] = useState<Record<string, SymptomExplanation>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explainSymptoms = async (
    symptoms: SymptomInput[]
  ): Promise<SymptomExplanation[]> => {
    if (symptoms.length === 0) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<ExplainSymptomsResponse>(
        'explain-symptoms',
        {
          body: { symptoms }
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data || !data.explanations) {
        throw new Error('Invalid response from AI');
      }

      // Create a map of symptom name to explanation
      const explanationMap: Record<string, SymptomExplanation> = {};
      data.explanations.forEach(exp => {
        explanationMap[exp.symptomName.toLowerCase()] = exp;
      });

      setExplanations(prev => ({ ...prev, ...explanationMap }));
      toast.success('Medical descriptions generated');
      return data.explanations;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching symptom descriptions';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(message);
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getExplanation = (symptomName: string): SymptomExplanation | undefined => {
    return explanations[symptomName.toLowerCase()];
  };

  const clearExplanations = () => {
    setExplanations({});
    setError(null);
  };

  return {
    explanations,
    isLoading,
    error,
    explainSymptoms,
    getExplanation,
    clearExplanations,
  };
};
