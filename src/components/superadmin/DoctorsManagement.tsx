import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
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
}

const DoctorsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (doctorsError) throw doctorsError;

      // Fetch profiles for each doctor
      const doctorsWithProfiles = await Promise.all(
        (doctorsData || []).map(async (doctor) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('user_id', doctor.user_id)
            .single();

          return { ...doctor, profile };
        })
      );

      return doctorsWithProfiles as Doctor[];
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
      doctor.registration_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Doctors Management</CardTitle>
            <CardDescription>Manage all registered doctors in the system</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
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
              placeholder="Search doctors..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration No.</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors?.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.profile?.name || 'N/A'}</TableCell>
                      <TableCell>{doctor.profile?.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doctor.registration_no || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.clinic_name || 'Not set'}</TableCell>
                      <TableCell>{format(new Date(doctor.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(doctor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorsManagement;
