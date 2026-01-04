import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';

export default function NewPatient() {
  const navigate = useNavigate();
  const { createPatient, doctorId } = usePatients();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    mobile: '',
    address: '',
    case_type: 'new',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorId) {
      return;
    }

    setSubmitting(true);
    const success = await createPatient({
      name: formData.name,
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      mobile: formData.mobile,
      address: formData.address || undefined,
      case_type: formData.case_type,
    });

    setSubmitting(false);
    
    if (success) {
      navigate('/patients');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <MainLayout title="Register New Patient" subtitle="Add a new patient to your records">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate('/patients')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </button>

        <div className="medical-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Patient Information</h2>
              <p className="text-sm text-muted-foreground">Fill in the patient details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient name"
                  className="medical-input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="0"
                  max="120"
                  placeholder="Enter age"
                  className="medical-input"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="medical-input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  placeholder="+91 98765 43210"
                  className="medical-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Enter complete address"
                className="medical-input resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Case Type *
              </label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="case_type"
                    value="new"
                    checked={formData.case_type === 'new'}
                    onChange={handleChange}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">New Case</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="case_type"
                    value="old"
                    checked={formData.case_type === 'old'}
                    onChange={handleChange}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Follow-up Case</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="medical-btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="medical-btn-primary"
                disabled={submitting || !doctorId}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Register Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
