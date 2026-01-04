import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, Pill, Stethoscope } from 'lucide-react';
import DoctorsManagement from '@/components/superadmin/DoctorsManagement';
import ClinicAnalytics from '@/components/superadmin/ClinicAnalytics';
import SymptomsManagement from '@/components/superadmin/SymptomsManagement';
import MedicinesManagement from '@/components/superadmin/MedicinesManagement';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('doctors');

  return (
    <MainLayout title="Super Admin" subtitle="Manage doctors, analytics, and global configurations">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage doctors, analytics, and global configurations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="doctors" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="medicines" className="gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Medicines</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors">
            <DoctorsManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <ClinicAnalytics />
          </TabsContent>

          <TabsContent value="symptoms">
            <SymptomsManagement />
          </TabsContent>

          <TabsContent value="medicines">
            <MedicinesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SuperAdmin;
