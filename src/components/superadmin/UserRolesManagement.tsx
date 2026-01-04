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
import { Search, Shield, ShieldCheck, User, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type AppRole = 'super_admin' | 'doctor' | 'staff';

interface UserWithRole {
  user_id: string;
  role: AppRole;
  created_at: string;
  profile?: {
    name: string;
    email: string;
    phone: string | null;
  };
}

const UserRolesManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('doctor');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch profiles for each user
      const usersWithProfiles = await Promise.all(
        (rolesData || []).map(async (roleEntry) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('user_id', roleEntry.user_id)
            .maybeSingle();

          return {
            ...roleEntry,
            profile,
          };
        })
      );

      return usersWithProfiles as UserWithRole[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;

      // If changing from doctor to another role, we may need to handle doctor record
      // For now, we just update the role
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('User role updated successfully');
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Role update error:', error);
      toast.error('Failed to update user role');
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="h-4 w-4" />;
      case 'doctor':
        return <UserCog className="h-4 w-4" />;
      case 'staff':
        return <User className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-destructive gap-1">{getRoleIcon(role)} Super Admin</Badge>;
      case 'doctor':
        return <Badge variant="default" className="gap-1">{getRoleIcon(role)} Doctor</Badge>;
      case 'staff':
        return <Badge variant="secondary" className="gap-1">{getRoleIcon(role)} Staff</Badge>;
      default:
        return <Badge variant="outline" className="gap-1">{getRoleIcon(role)} {role}</Badge>;
    }
  };

  const openRoleChange = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleRoleChange = () => {
    if (!selectedUser) return;
    updateRoleMutation.mutate({
      userId: selectedUser.user_id,
      role: newRole,
    });
  };

  const roleStats = {
    total: users?.length || 0,
    superAdmins: users?.filter(u => u.role === 'super_admin').length || 0,
    doctors: users?.filter(u => u.role === 'doctor').length || 0,
    staff: users?.filter(u => u.role === 'staff').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ShieldCheck className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleStats.superAdmins}</p>
                <p className="text-sm text-muted-foreground">Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <UserCog className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleStats.doctors}</p>
                <p className="text-sm text-muted-foreground">Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleStats.staff}</p>
                <p className="text-sm text-muted-foreground">Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles Management</CardTitle>
          <CardDescription>View and modify user roles across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
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
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Assigned On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="font-medium">{user.profile?.name || 'Unknown'}</div>
                          {user.profile?.phone && (
                            <div className="text-xs text-muted-foreground">{user.profile.phone}</div>
                          )}
                        </TableCell>
                        <TableCell>{user.profile?.email || 'N/A'}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleChange(user)}
                            className="gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            Change Role
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

      {/* Role Change Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.profile?.name || 'this user'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{selectedUser?.profile?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser?.profile?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div>{selectedUser && getRoleBadge(selectedUser.role)}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as AppRole)}>
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Staff
                    </div>
                  </SelectItem>
                  <SelectItem value="doctor">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Doctor
                    </div>
                  </SelectItem>
                  <SelectItem value="super_admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newRole === 'super_admin' && 'Super Admins have full access to all features and can manage other users.'}
                {newRole === 'doctor' && 'Doctors can manage patients, create prescriptions, and access their own data.'}
                {newRole === 'staff' && 'Staff have limited access to assist with day-to-day operations.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange} 
              disabled={updateRoleMutation.isPending || newRole === selectedUser?.role}
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRolesManagement;
