import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useMedicines, Medicine, MedicineFormData } from '@/hooks/useMedicines';
import { Search, Plus, Pill, Filter, AlertTriangle, Info, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DEFAULT_CATEGORIES = [
  'Temperament',
  'Blood Purifier',
  'Lymphatic',
  'Digestive',
  'Respiratory',
  'Nervous',
  'Urinary',
  'Reproductive',
  'Skin',
  'General Tonic',
];

export default function Medicines() {
  const { medicines, loading, categories, createMedicine, updateMedicine, deleteMedicine, doctorId } = useMedicines();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    category: '',
    indications: '',
    default_dosage: '',
    contra_indications: '',
    notes: '',
  });

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (medicine.indications?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddForm = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      category: DEFAULT_CATEGORIES[0],
      indications: '',
      default_dosage: '',
      contra_indications: '',
      notes: '',
    });
    setShowForm(true);
  };

  const openEditForm = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      indications: medicine.indications || '',
      default_dosage: medicine.default_dosage || '',
      contra_indications: medicine.contra_indications || '',
      notes: medicine.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingMedicine) {
      updateMedicine({ id: editingMedicine.id, ...formData });
    } else {
      createMedicine(formData);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMedicine(deleteId);
      setDeleteId(null);
    }
  };

  const canEdit = (medicine: Medicine) => {
    return !medicine.is_global && medicine.doctor_id === doctorId;
  };

  if (loading) {
    return (
      <MainLayout title="Medicine Library" subtitle="Electro Homoeopathy medicine database">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Medicine Library" subtitle="Electro Homoeopathy medicine database">
      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search medicines by name or indication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="medical-input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="medical-input appearance-none pl-10 pr-10"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={openAddForm} className="medical-btn-primary">
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{medicines.length}</p>
          <p className="text-sm text-muted-foreground">Total Medicines</p>
        </div>
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-accent">{medicines.filter(m => m.is_global).length}</p>
          <p className="text-sm text-muted-foreground">Global</p>
        </div>
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{medicines.filter(m => !m.is_global).length}</p>
          <p className="text-sm text-muted-foreground">Custom</p>
        </div>
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{allCategories.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMedicines.map((medicine, index) => (
          <div
            key={medicine.id}
            className="medical-card animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <Pill className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{medicine.name}</h3>
                  <span className="medical-badge-primary">{medicine.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {medicine.is_global ? (
                  <span className="medical-badge bg-secondary text-muted-foreground">Global</span>
                ) : (
                  <span className="medical-badge bg-accent/10 text-accent">Custom</span>
                )}
              </div>
            </div>

            <div className="mb-4 space-y-3">
              {medicine.indications && (
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Info className="h-3.5 w-3.5" />
                    Indications
                  </div>
                  <p className="text-sm text-foreground">{medicine.indications}</p>
                </div>
              )}

              {medicine.default_dosage && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Default Dosage</p>
                  <p className="text-sm font-medium text-foreground">{medicine.default_dosage}</p>
                </div>
              )}

              {medicine.contra_indications && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Contra-indications
                  </div>
                  <p className="mt-1 text-xs text-foreground">{medicine.contra_indications}</p>
                </div>
              )}

              {medicine.notes && (
                <p className="text-xs text-muted-foreground italic">{medicine.notes}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              {canEdit(medicine) ? (
                <>
                  <button
                    onClick={() => openEditForm(medicine)}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(medicine.id)}
                    className="flex items-center gap-1 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Read only</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Pill className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">No medicines found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Medicine Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., C1 - Canceroso"
                className="medical-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="medical-input"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Indications</label>
              <textarea
                value={formData.indications}
                onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                placeholder="What conditions is this medicine used for?"
                rows={2}
                className="medical-input resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Default Dosage</label>
              <input
                type="text"
                value={formData.default_dosage}
                onChange={(e) => setFormData({ ...formData, default_dosage: e.target.value })}
                placeholder="e.g., 10 drops twice daily"
                className="medical-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Contra-indications</label>
              <textarea
                value={formData.contra_indications}
                onChange={(e) => setFormData({ ...formData, contra_indications: e.target.value })}
                placeholder="When should this medicine NOT be used?"
                rows={2}
                className="medical-input resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
                className="medical-input resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowForm(false)} className="medical-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="medical-btn-primary">
                {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this medicine from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}