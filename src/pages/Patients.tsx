import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePatients, Patient } from '@/hooks/usePatients';
import { exportPatientsToCSV } from '@/utils/exportUtils';
import { PatientSearchFilters, PatientFilters, defaultFilters } from '@/components/patients/PatientSearchFilters';
import { Plus, User, Phone, MapPin, Calendar, MoreVertical, FileText, Stethoscope, Trash2, Edit, Loader2, Download, History, Search } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Patients() {
  const { patients, loading, deletePatient, updatePatient } = usePatients();
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({ name: '', age: '', mobile: '', address: '' });
  const [showFilters, setShowFilters] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Text search
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch =
        !filters.searchQuery ||
        patient.name.toLowerCase().includes(searchLower) ||
        patient.patient_id.toLowerCase().includes(searchLower) ||
        patient.mobile.includes(filters.searchQuery) ||
        (patient.address?.toLowerCase().includes(searchLower) ?? false);

      // Case type filter
      const matchesCaseType =
        filters.caseType === 'all' || patient.case_type === filters.caseType;

      // Gender filter
      const matchesGender =
        filters.gender === 'all' || patient.gender.toLowerCase() === filters.gender;

      // Age range filter
      const matchesAge =
        (filters.ageRange.min === null || patient.age >= filters.ageRange.min) &&
        (filters.ageRange.max === null || patient.age <= filters.ageRange.max);

      // Date range filter
      const visitDate = new Date(patient.visit_date);
      const matchesDateFrom =
        !filters.dateRange.from ||
        isAfter(visitDate, startOfDay(filters.dateRange.from)) ||
        visitDate.toDateString() === filters.dateRange.from.toDateString();
      const matchesDateTo =
        !filters.dateRange.to ||
        isBefore(visitDate, endOfDay(filters.dateRange.to)) ||
        visitDate.toDateString() === filters.dateRange.to.toDateString();

      return (
        matchesSearch &&
        matchesCaseType &&
        matchesGender &&
        matchesAge &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [patients, filters]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePatient(deleteId);
      setDeleteId(null);
    }
  };

  const openEdit = (patient: Patient) => {
    setEditPatient(patient);
    setEditForm({
      name: patient.name,
      age: patient.age.toString(),
      mobile: patient.mobile,
      address: patient.address || '',
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPatient) {
      await updatePatient(editPatient.id, {
        name: editForm.name,
        age: parseInt(editForm.age, 10),
        mobile: editForm.mobile,
        address: editForm.address || undefined,
      });
      setEditPatient(null);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Patients" subtitle="Manage your patient records">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Patients" subtitle="Manage your patient records">
      {/* Mobile Search */}
      <div className="mb-4 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Desktop Search & Filters */}
      <div className="hidden sm:block mb-6 space-y-4">
        <PatientSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>
        
      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {filteredPatients.length} of {patients.length} patients
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportPatientsToCSV(filteredPatients);
              toast.success('Patients exported to CSV');
            }}
            disabled={filteredPatients.length === 0}
            className="medical-btn-secondary hidden sm:flex"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link to="/patients/new" className="medical-btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Patient</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient, index) => (
          <div
            key={patient.id}
            className="medical-card group animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="mb-3 sm:mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{patient.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{patient.patient_id}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="touch-target flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(patient)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteId(patient.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">{patient.age}y</span>
                <span>•</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{patient.mobile}</span>
              </div>
              {patient.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{patient.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Last: {format(new Date(patient.visit_date), 'dd MMM yyyy')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 sm:pt-4">
              <span
                className={cn(
                  'medical-badge text-[10px] sm:text-xs',
                  patient.case_type === 'new'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {patient.case_type === 'new' ? 'New Case' : 'Follow-up'}
              </span>
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to={`/patients/history?patient=${patient.id}`}
                  className="touch-target flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="View History"
                >
                  <History className="h-4 w-4" />
                </Link>
                <Link
                  to={`/prescriptions?patient=${patient.id}`}
                  className="touch-target flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="View Prescriptions"
                >
                  <FileText className="h-4 w-4" />
                </Link>
                <Link
                  to={`/consultation?patient=${patient.id}`}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-primary px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-primary-foreground transition-all hover:opacity-90"
                >
                  <Stethoscope className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Consult
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">No patients found</h3>
          <p className="text-sm text-muted-foreground">
            {filters.searchQuery
              ? 'Try adjusting your search'
              : 'Start by adding your first patient'}
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPatient} onOpenChange={() => setEditPatient(null)}>
        <DialogContent className="rounded-2xl mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="medical-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Age</label>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  className="medical-input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mobile</label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="medical-input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Address</label>
              <textarea
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="medical-input resize-none"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditPatient(null)} className="medical-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="medical-btn-primary">
                Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
