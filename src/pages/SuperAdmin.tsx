import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, Pill, Stethoscope, BookOpen, TrendingUp, Clock, Shield } from 'lucide-react';
import DoctorsManagement from '@/components/superadmin/DoctorsManagement';
import ClinicAnalytics from '@/components/superadmin/ClinicAnalytics';
import SymptomsManagement from '@/components/superadmin/SymptomsManagement';
import MedicinesManagement from '@/components/superadmin/MedicinesManagement';
import RulesManagement from '@/components/superadmin/RulesManagement';
import ActivityFeed from '@/components/superadmin/ActivityFeed';
import DoctorPerformance from '@/components/superadmin/DoctorPerformance';
import UserRolesManagement from '@/components/superadmin/UserRolesManagement';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <MainLayout title="Super Admin" subtitle="Manage doctors, analytics, and global configurations">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive platform management and analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="medicines" className="gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Medicines</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">User Roles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <ClinicAnalytics />
          </TabsContent>

          <TabsContent value="activity">
            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityFeed />
              <div className="space-y-6">
                <DoctorPerformance />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <DoctorPerformance />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorsManagement />
          </TabsContent>

          <TabsContent value="symptoms">
            <SymptomsManagement />
          </TabsContent>

          <TabsContent value="medicines">
            <MedicinesManagement />
          </TabsContent>

          <TabsContent value="rules">
            <RulesManagement />
          </TabsContent>

          <TabsContent value="roles">
            <UserRolesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SuperAdmin;
