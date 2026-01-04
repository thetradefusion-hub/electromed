import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockRules, mockSymptoms, mockMedicines } from '@/data/mockData';
import { BookOpen, Plus, Edit, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Rules() {
  const [rules] = useState(mockRules);

  const getSymptomNames = (ids: string[]) =>
    ids
      .map((id) => mockSymptoms.find((s) => s.id === id)?.name || 'Unknown')
      .join(', ');

  const getMedicineNames = (ids: string[]) =>
    ids
      .map((id) => mockMedicines.find((m) => m.id === id)?.name || 'Unknown')
      .join(', ');

  return (
    <MainLayout title="Medicine Rules Engine" subtitle="Configure symptom-to-medicine mapping rules">
      {/* Info Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">How Rules Work</p>
          <p className="text-xs text-muted-foreground">
            When symptoms are selected during consultation, the system evaluates rules in priority order. 
            Doctor-specific rules take precedence over global admin rules. Matching rules suggest appropriate medicines with dosage and duration.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {rules.length} rules configured
          </p>
        </div>
        <button className="medical-btn-primary">
          <Plus className="h-4 w-4" />
          Create New Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className="medical-card animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Rule #{rule.id.split('-')[1]}</p>
                  <p className="text-xs text-muted-foreground">
                    Priority: {rule.priority} • Created: {format(rule.createdAt, 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    rule.isGlobal
                      ? 'medical-badge-primary'
                      : 'medical-badge bg-secondary text-secondary-foreground'
                  }
                >
                  {rule.isGlobal ? 'Global' : 'Doctor'}
                </span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Symptoms */}
              <div className="flex-1">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  IF Symptoms Include
                </p>
                <div className="flex flex-wrap gap-2">
                  {rule.symptoms.map((sId) => {
                    const symptom = mockSymptoms.find((s) => s.id === sId);
                    return (
                      <span key={sId} className="medical-badge bg-warning/10 text-warning">
                        {symptom?.name || 'Unknown'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />

              {/* Medicines */}
              <div className="flex-1">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  THEN Suggest
                </p>
                <div className="flex flex-wrap gap-2">
                  {rule.medicines.map((mId) => {
                    const medicine = mockMedicines.find((m) => m.id === mId);
                    return (
                      <span key={mId} className="medical-badge-accent">
                        {medicine?.name || 'Unknown'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dosage: </span>
                <span className="font-medium text-foreground">{rule.dosage}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration: </span>
                <span className="font-medium text-foreground">{rule.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">No rules configured</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first rule to enable medicine suggestions
          </p>
          <button className="medical-btn-primary">
            <Plus className="h-4 w-4" />
            Create First Rule
          </button>
        </div>
      )}
    </MainLayout>
  );
}
