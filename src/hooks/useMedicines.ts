import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  created_at: string;
}

export interface MedicineFormData {
  name: string;
  category: string;
  indications?: string;
  default_dosage?: string;
  contra_indications?: string;
  notes?: string;
}

export const useMedicines = () => {
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

  // Fetch medicines
  const { data: medicines = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['medicines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching medicines:', error);
        return [];
      }
      return data as Medicine[];
    },
    enabled: !!user,
  });

  // Create medicine
  const createMutation = useMutation({
    mutationFn: async (formData: MedicineFormData) => {
      if (!doctorId) throw new Error('Doctor not found');

      const { data, error } = await supabase
        .from('medicines')
        .insert({
          name: formData.name,
          category: formData.category,
          indications: formData.indications || null,
          default_dosage: formData.default_dosage || null,
          contra_indications: formData.contra_indications || null,
          notes: formData.notes || null,
          is_global: false,
          doctor_id: doctorId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add medicine: ' + error.message);
    },
  });

  // Update medicine
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...formData }: MedicineFormData & { id: string }) => {
      const { error } = await supabase
        .from('medicines')
        .update({
          name: formData.name,
          category: formData.category,
          indications: formData.indications || null,
          default_dosage: formData.default_dosage || null,
          contra_indications: formData.contra_indications || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update medicine: ' + error.message);
    },
  });

  // Delete medicine
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete medicine: ' + error.message);
    },
  });

  // Get unique categories
  const categories = [...new Set(medicines.map((m) => m.category))].sort();

  return {
    medicines,
    loading,
    categories,
    doctorId,
    createMedicine: createMutation.mutate,
    updateMedicine: updateMutation.mutate,
    deleteMedicine: deleteMutation.mutate,
    refetch,
  };
};