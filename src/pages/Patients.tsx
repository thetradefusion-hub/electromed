import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockPatients } from '@/data/mockData';
import { Search, Plus, Filter, User, Phone, MapPin, Calendar, MoreVertical, FileText, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'old'>('all');

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mobile.includes(searchQuery);
    const matchesFilter = filterType === 'all' || patient.caseType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout title="Patients" subtitle="Manage your patient records">
      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="medical-input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                filterType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('new')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                filterType === 'new'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              New
            </button>
            <button
              onClick={() => setFilterType('old')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                filterType === 'old'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Follow-up
            </button>
          </div>
        </div>
        <Link
          to="/patients/new"
          className="medical-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </Link>
      </div>

      {/* Patients Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient, index) => (
          <div
            key={patient.id}
            className="medical-card group animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">{patient.patientId}</p>
                </div>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">{patient.age} years</span>
                <span>•</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{patient.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last visit: {format(patient.visitDate, 'dd MMM yyyy')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span
                className={cn(
                  'medical-badge',
                  patient.caseType === 'new'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {patient.caseType === 'new' ? 'New Case' : 'Follow-up'}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/prescriptions?patient=${patient.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="View Prescriptions"
                >
                  <FileText className="h-4 w-4" />
                </Link>
                <Link
                  to={`/consultation?patient=${patient.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:opacity-90"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  Consult
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">No patients found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Start by adding your first patient'}
          </p>
        </div>
      )}
    </MainLayout>
  );
}
