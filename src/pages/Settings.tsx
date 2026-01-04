import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { currentDoctor } from '@/data/mockData';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Award,
  Save,
  Shield,
  Bell,
  Palette,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: currentDoctor.name,
    email: currentDoctor.email,
    phone: currentDoctor.phone,
    registrationNo: currentDoctor.registrationNo,
    qualification: currentDoctor.qualification,
    specialization: currentDoctor.specialization,
    clinicName: currentDoctor.clinicName,
    clinicAddress: currentDoctor.clinicAddress,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'clinic', label: 'Clinic', icon: Building },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <MainLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="medical-card lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <div className="medical-card animate-fade-in">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Doctor Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    Registration No.
                  </label>
                  <input
                    type="text"
                    value={profile.registrationNo}
                    onChange={(e) =>
                      setProfile({ ...profile, registrationNo: e.target.value })
                    }
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={profile.qualification}
                    onChange={(e) =>
                      setProfile({ ...profile, qualification: e.target.value })
                    }
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={(e) =>
                      setProfile({ ...profile, specialization: e.target.value })
                    }
                    className="medical-input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="medical-card animate-fade-in">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-accent">
                  <Building className="h-10 w-10 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Clinic Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your clinic information
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    value={profile.clinicName}
                    onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Clinic Address
                  </label>
                  <textarea
                    value={profile.clinicAddress}
                    onChange={(e) =>
                      setProfile({ ...profile, clinicAddress: e.target.value })
                    }
                    rows={3}
                    className="medical-input resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="medical-card animate-fade-in">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
                  <Shield className="h-10 w-10 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your password and security preferences
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    Current Password
                  </label>
                  <input type="password" placeholder="••••••••" className="medical-input" />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    New Password
                  </label>
                  <input type="password" placeholder="••••••••" className="medical-input" />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    Confirm New Password
                  </label>
                  <input type="password" placeholder="••••••••" className="medical-input" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="medical-card animate-fade-in">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
                  <Bell className="h-10 w-10 text-warning" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose what notifications you want to receive
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Follow-up reminders', description: 'Get notified about pending follow-ups' },
                  { label: 'New patient registrations', description: 'When a new patient is registered' },
                  { label: 'Daily summary', description: 'Receive daily activity summary' },
                  { label: 'System updates', description: 'Important system announcements' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="h-6 w-11 rounded-full bg-secondary peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="medical-card animate-fade-in">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
                  <Palette className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
                  <p className="text-sm text-muted-foreground">
                    Customize how the app looks
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Theme customization options will be available soon.
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button onClick={handleSave} className="medical-btn-primary">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
