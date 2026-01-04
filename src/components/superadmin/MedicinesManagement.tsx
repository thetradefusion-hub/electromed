import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Medicine {
  id: string;
  name: string;
  category: string;
  indications: string | null;
  default_dosage: string | null;
  contra_indications: string | null;
  notes: string | null;
  is_global: boolean;
  created_at: string;
}

const MEDICINE_CATEGORIES = [
  'Spagyric Essence',
  'Electricities',
  'Cohobations',
  'S1-S10 Series',
  'C1-C17 Series',
  'GE Series',
  'YE Series',
  'WE Series',
  'RE Series',
  'BE Series',
  'Combination Remedies',
  'External Applications',
  'Other',
];

const MedicinesManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    indications: '',
    default_dosage: '',
    contra_indications: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['admin-medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('is_global', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Medicine[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('medicines').insert({
        name: data.name,
        category: data.category,
        indications: data.indications || null,
        default_dosage: data.default_dosage || null,
        contra_indications: data.contra_indications || null,
        notes: data.notes || null,
        is_global: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      toast.success('Medicine added successfully');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to add medicine');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('medicines')
        .update({
          name: data.name,
          category: data.category,
          indications: data.indications || null,
          default_dosage: data.default_dosage || null,
          contra_indications: data.contra_indications || null,
          notes: data.notes || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      toast.success('Medicine updated successfully');
      setEditingMedicine(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update medicine');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      toast.success('Medicine deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete medicine');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      indications: '',
      default_dosage: '',
      contra_indications: '',
      notes: '',
    });
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      indications: medicine.indications || '',
      default_dosage: medicine.default_dosage || '',
      contra_indications: medicine.contra_indications || '',
      notes: medicine.notes || '',
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const filteredMedicines = medicines?.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Global Medicines</CardTitle>
            <CardDescription>Manage global medicine library available to all doctors</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen || !!editingMedicine} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingMedicine(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
                <DialogDescription>
                  {editingMedicine ? 'Update the medicine details' : 'Add a new medicine to the global library'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., S1 Scrofulite"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICINE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_dosage">Default Dosage</Label>
                  <Input
                    id="default_dosage"
                    value={formData.default_dosage}
                    onChange={(e) => setFormData({ ...formData, default_dosage: e.target.value })}
                    placeholder="e.g., 10-15 drops, 3 times daily"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indications">Indications</Label>
                  <Textarea
                    id="indications"
                    value={formData.indications}
                    onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                    placeholder="Conditions this medicine is used for..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contra_indications">Contra-indications</Label>
                  <Textarea
                    id="contra_indications"
                    value={formData.contra_indications}
                    onChange={(e) => setFormData({ ...formData, contra_indications: e.target.value })}
                    placeholder="Conditions where this medicine should not be used..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingMedicine(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={addMutation.isPending || updateMutation.isPending}>
                  {editingMedicine ? 'Update' : 'Add'} Medicine
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Default Dosage</TableHead>
                  <TableHead>Indications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No medicines found. Add your first global medicine.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicines?.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{medicine.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {medicine.default_dosage || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {medicine.indications || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(medicine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(medicine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicinesManagement;
