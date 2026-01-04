import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSymptoms, Symptom, SymptomFormData } from '@/hooks/useSymptoms';
import {
  Search,
  Plus,
  Stethoscope,
  Filter,
  Edit,
  Trash2,
  Loader2,
  Tag,
} from 'lucide-react';
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
  'General',
  'Head & Nervous System',
  'Respiratory',
  'Digestive',
  'Cardiovascular',
  'Urinary',
  'Skin',
  'Musculoskeletal',
  'Reproductive',
  'Mental & Emotional',
];

export default function Symptoms() {
  const { symptoms, loading, categories, createSymptom, updateSymptom, deleteSymptom, doctorId } = useSymptoms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<SymptomFormData>({
    name: '',
    category: '',
    description: '',
  });

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();

  const filteredSymptoms = symptoms.filter((symptom) => {
    const matchesSearch =
      symptom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (symptom.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      selectedCategory === 'all' || symptom.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group symptoms by category
  const groupedSymptoms = filteredSymptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, Symptom[]>);

  const openAddForm = () => {
    setEditingSymptom(null);
    setFormData({
      name: '',
      category: DEFAULT_CATEGORIES[0],
      description: '',
    });
    setShowForm(true);
  };

  const openEditForm = (symptom: Symptom) => {
    setEditingSymptom(symptom);
    setFormData({
      name: symptom.name,
      category: symptom.category,
      description: symptom.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingSymptom) {
      updateSymptom({ id: editingSymptom.id, ...formData });
    } else {
      createSymptom(formData);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteSymptom(deleteId);
      setDeleteId(null);
    }
  };

  const canEdit = (symptom: Symptom) => {
    return !symptom.is_global && symptom.doctor_id === doctorId;
  };

  if (loading) {
    return (
      <MainLayout title="Symptoms Library" subtitle="Manage symptoms for consultations">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Symptoms Library" subtitle="Manage symptoms for consultations">
      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symptoms..."
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
          Add Symptom
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{symptoms.length}</p>
          <p className="text-sm text-muted-foreground">Total Symptoms</p>
        </div>
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-accent">{symptoms.filter(s => s.is_global).length}</p>
          <p className="text-sm text-muted-foreground">Global</p>
        </div>
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{symptoms.filter(s => !s.is_global).length}</p>
          <p className="text-sm text-muted-foreground">Custom</p>
        </div>
        <div className="medical-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{allCategories.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
      </div>

      {/* Symptoms by Category */}
      {Object.keys(groupedSymptoms).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Stethoscope className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">No symptoms found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or add a new symptom
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
            <div key={category} className="medical-card">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{category}</h3>
                <span className="medical-badge bg-primary/10 text-primary">
                  {categorySymptoms.length}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorySymptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    className={cn(
                      'rounded-lg border p-3 transition-all',
                      symptom.is_global
                        ? 'border-border bg-card'
                        : 'border-accent/30 bg-accent/5'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{symptom.name}</p>
                          {symptom.is_global ? (
                            <span className="text-xs text-muted-foreground">(Global)</span>
                          ) : (
                            <span className="text-xs text-accent">(Custom)</span>
                          )}
                        </div>
                        {symptom.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {symptom.description}
                          </p>
                        )}
                      </div>

                      {canEdit(symptom) && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditForm(symptom)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(symptom.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSymptom ? 'Edit Symptom' : 'Add New Symptom'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Symptom Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Headache, Fever, Cough"
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
              <label className="mb-1.5 block text-sm font-medium">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this symptom..."
                rows={3}
                className="medical-input resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowForm(false)} className="medical-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="medical-btn-primary">
                {editingSymptom ? 'Update Symptom' : 'Add Symptom'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Symptom?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this symptom.
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