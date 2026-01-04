import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
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
  Loader2,
  Eye,
  EyeOff,
  Crown,
  Check,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  registrationNo: string;
  qualification: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    registrationNo: '',
    qualification: '',
    specialization: '',
    clinicName: '',
    clinicAddress: '',
  });

  // Subscription data
  const { subscription, usage, isLoading: subscriptionLoading, planName } = useSubscription();

  // Fetch all plans
  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch doctor data
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('registration_no, qualification, specialization, clinic_name, clinic_address')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile({
        name: profileData?.name || '',
        email: profileData?.email || user.email || '',
        phone: profileData?.phone || '',
        registrationNo: doctorData?.registration_no || '',
        qualification: doctorData?.qualification || '',
        specialization: doctorData?.specialization || '',
        clinicName: doctorData?.clinic_name || '',
        clinicAddress: doctorData?.clinic_address || '',
      });

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update doctor
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          registration_no: profile.registrationNo,
          qualification: profile.qualification,
          specialization: profile.specialization,
          clinic_name: profile.clinicName,
          clinic_address: profile.clinicAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (doctorError) throw doctorError;

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save settings');
    }

    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    }

    setChangingPassword(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'clinic', label: 'Clinic', icon: Building },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  if (loading) {
    return (
      <MainLayout title="Settings" subtitle="Manage your account and preferences">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
                    disabled
                    className="medical-input bg-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
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

          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-fade-in">
              {/* Current Plan */}
              <div className="medical-card">
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${
                    planName === 'Enterprise' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                    planName === 'Professional' ? 'bg-gradient-to-br from-primary to-accent' :
                    'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Current Plan: {planName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {subscription ? (
                        <>Renews on {format(new Date(subscription.current_period_end), 'MMMM dd, yyyy')}</>
                      ) : (
                        'No active subscription'
                      )}
                    </p>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Usage This Period</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-2xl font-bold text-foreground">{usage?.patientsCount || 0}</p>
                      <p className="text-sm text-muted-foreground">
                        of {subscription?.plan?.patient_limit || '∞'} Patients
                      </p>
                      {subscription?.plan?.patient_limit && (
                        <Progress 
                          value={Math.min(100, ((usage?.patientsCount || 0) / subscription.plan.patient_limit) * 100)} 
                          className="mt-2 h-1.5"
                        />
                      )}
                    </div>
                    
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-2xl font-bold text-foreground">{usage?.prescriptionsCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                    </div>
                    
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-2xl font-bold text-foreground">{usage?.aiAnalysisCount || 0}</p>
                      <p className="text-sm text-muted-foreground">
                        of {subscription?.plan?.ai_analysis_quota || '∞'} AI Analysis
                      </p>
                      {subscription?.plan?.ai_analysis_quota && (
                        <Progress 
                          value={Math.min(100, ((usage?.aiAnalysisCount || 0) / subscription.plan.ai_analysis_quota) * 100)} 
                          className="mt-2 h-1.5"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <div className="medical-card">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {plans?.map((plan) => {
                    const isCurrentPlan = subscription?.plan_id === plan.id;
                    const features = Array.isArray(plan.features) ? plan.features : [];
                    
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border p-5 transition-all ${
                          isCurrentPlan 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isCurrentPlan && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                              Current Plan
                            </span>
                          </div>
                        )}
                        
                        <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-foreground">₹{plan.price_monthly}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        
                        <ul className="mt-4 space-y-2">
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{plan.patient_limit ? `${plan.patient_limit} Patients` : 'Unlimited Patients'}</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{plan.ai_analysis_quota} AI Analysis/month</span>
                          </li>
                          {features.slice(0, 3).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {!isCurrentPlan && (
                          <button className="mt-4 w-full medical-btn-secondary text-sm">
                            <Sparkles className="h-4 w-4" />
                            Upgrade
                          </button>
                        )}
                      </div>
                    );
                  })}
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
                    Change your password
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      placeholder="••••••••"
                      className="medical-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="••••••••"
                      className="medical-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-foreground">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="medical-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="medical-btn-secondary"
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Change Password
                </button>
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
          {(activeTab === 'profile' || activeTab === 'clinic') && (
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} className="medical-btn-primary">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}