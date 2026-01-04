import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit, Trash2, UserPlus, Save, X, Mail, Phone, Building } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Doctor {
  id: string;
  user_id: string;
  registration_no: string;
  qualification: string;
  specialization: string;
  clinic_name: string | null;
  clinic_address: string | null;
  created_at: string;
  profile?: {
    name: string;
    email: string;
    phone: string | null;
  };
  role?: string;
}

const DoctorsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    qualification: '',
    specialization: '',
    clinic_name: '',
    clinic_address: '',
    registration_no: '',
  });
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (doctorsError) throw doctorsError;

      // Fetch profiles and roles for each doctor
      const doctorsWithProfiles = await Promise.all(
        (doctorsData || []).map(async (doctor) => {
          const [profileResult, roleResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('name, email, phone')
              .eq('user_id', doctor.user_id)
              .maybeSingle(),
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', doctor.user_id)
              .maybeSingle(),
          ]);

          return {
            ...doctor,
            profile: profileResult.data,
            role: roleResult.data?.role || 'doctor',
          };
        })
      );

      return doctorsWithProfiles as Doctor[];
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: async (data: { doctorId: string; userId: string; form: typeof editForm }) => {
      // Update doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          qualification: data.form.qualification,
          specialization: data.form.specialization,
          clinic_name: data.form.clinic_name || null,
          clinic_address: data.form.clinic_address || null,
          registration_no: data.form.registration_no,
        })
        .eq('id', data.doctorId);

      if (doctorError) throw doctorError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.form.name,
          phone: data.form.phone || null,
        })
        .eq('user_id', data.userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Doctor updated successfully');
      setEditingDoctor(null);
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update doctor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const { error } = await supabase.from('doctors').delete().eq('id', doctorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Doctor deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete doctor');
    },
  });

  const filteredDoctors = doctors?.filter(
    (doctor) =>
      doctor.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.registration_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.clinic_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.profile?.name || '',
      phone: doctor.profile?.phone || '',
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      clinic_name: doctor.clinic_name || '',
      clinic_address: doctor.clinic_address || '',
      registration_no: doctor.registration_no,
    });
  };

  const handleSaveEdit = () => {
    if (!editingDoctor) return;
    updateDoctorMutation.mutate({
      doctorId: editingDoctor.id,
      userId: editingDoctor.user_id,
      form: editForm,
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-destructive">Super Admin</Badge>;
      case 'doctor':
        return <Badge variant="default">Doctor</Badge>;
      case 'staff':
        return <Badge variant="secondary">Staff</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Doctors Management</CardTitle>
            <CardDescription>Manage all registered doctors in the system</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add Doctor
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>
                  Doctors can self-register by signing up. Use this form for manual additions.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                <p>Doctors register themselves through the signup page.</p>
                <p className="text-sm mt-2">
                  Share the registration link with new doctors to onboard them.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Close
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
              placeholder="Search by name, email, registration, or clinic..."
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
                  <TableHead>Doctor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors?.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doctor.profile?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{doctor.profile?.email || 'N/A'}</span>
                          </div>
                          {doctor.profile?.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{doctor.profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doctor.registration_no || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>
                        {doctor.clinic_name ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{doctor.clinic_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(doctor.role || 'doctor')}</TableCell>
                      <TableCell>{format(new Date(doctor.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(doctor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this doctor?')) {
                                deleteMutation.mutate(doctor.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingDoctor} onOpenChange={() => setEditingDoctor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_no">Registration No.</Label>
                <Input
                  id="registration_no"
                  value={editForm.registration_no}
                  onChange={(e) => setEditForm({ ...editForm, registration_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Clinic Name</Label>
              <Input
                id="clinic_name"
                value={editForm.clinic_name}
                onChange={(e) => setEditForm({ ...editForm, clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_address">Clinic Address</Label>
              <Input
                id="clinic_address"
                value={editForm.clinic_address}
                onChange={(e) => setEditForm({ ...editForm, clinic_address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoctor(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateDoctorMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateDoctorMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DoctorsManagement;
