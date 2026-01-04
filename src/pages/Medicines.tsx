import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockMedicines, medicineCategories } from '@/data/mockData';
import { Search, Plus, Pill, Filter, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Medicines() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  const filteredMedicines = mockMedicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.indications.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              {medicineCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="medical-btn-primary">
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
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
              {medicine.isGlobal && (
                <span className="medical-badge bg-secondary text-muted-foreground">Global</span>
              )}
            </div>

            <div className="mb-4 space-y-3">
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  Indications
                </div>
                <p className="text-sm text-foreground">{medicine.indications}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Default Dosage</p>
                <p className="text-sm font-medium text-foreground">{medicine.defaultDosage}</p>
              </div>

              {medicine.contraIndications && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Contra-indications
                  </div>
                  <p className="mt-1 text-xs text-foreground">{medicine.contraIndications}</p>
                </div>
              )}

              {medicine.notes && (
                <p className="text-xs text-muted-foreground italic">{medicine.notes}</p>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-border pt-4">
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Edit Details
              </button>
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
    </MainLayout>
  );
}
