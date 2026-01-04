import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Symptom {
  id: string;
  name: string;
  category: string;
  description: string | null;
  is_global: boolean;
  doctor_id: string | null;
  created_at: string;
}

export interface SymptomFormData {
  name: string;
  category: string;
  description?: string;
}

export const useSymptoms = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get doctor ID
  const { data: doctorId } = useQuery({
    queryKey: ['doctor-id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.id || null;
    },
    enabled: !!user,
  });

  // Fetch symptoms
  const { data: symptoms = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['symptoms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching symptoms:', error);
        return [];
      }
      return data as Symptom[];
    },
    enabled: !!user,
  });

  // Create symptom
  const createMutation = useMutation({
    mutationFn: async (formData: SymptomFormData) => {
      if (!doctorId) throw new Error('Doctor not found');

      const { data, error } = await supabase
        .from('symptoms')
        .insert({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          is_global: false,
          doctor_id: doctorId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add symptom: ' + error.message);
    },
  });

  // Update symptom
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...formData }: SymptomFormData & { id: string }) => {
      const { error } = await supabase
        .from('symptoms')
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update symptom: ' + error.message);
    },
  });

  // Delete symptom
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('symptoms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete symptom: ' + error.message);
    },
  });

  // Get unique categories
  const categories = [...new Set(symptoms.map((s) => s.category))].sort();

  return {
    symptoms,
    loading,
    categories,
    doctorId,
    createSymptom: createMutation.mutate,
    updateSymptom: updateMutation.mutate,
    deleteSymptom: deleteMutation.mutate,
    refetch,
  };
};