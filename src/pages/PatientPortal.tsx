 import { useState } from 'react';
 import { useAuth } from '@/hooks/useAuth';
 import { supabase } from '@/integrations/supabase/client';
 import { useQuery } from '@tanstack/react-query';
 import { Header } from '@/components/layout/Header';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Loader2, FileText, Calendar, Activity, Download, LogOut, User } from 'lucide-react';
 import { format } from 'date-fns';
 import { useNavigate } from 'react-router-dom';
 import { generatePrescriptionPDF } from '@/utils/generatePrescriptionPDF';
 import { useToast } from '@/hooks/use-toast';
 
 const PatientPortal = () => {
   const { user, signOut } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
   const [downloadingId, setDownloadingId] = useState<string | null>(null);
 
   // Fetch patient user data
   const { data: patientUser, isLoading: patientUserLoading } = useQuery({
     queryKey: ['patient-user', user?.id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('patient_users')
         .select('*, patients(*)')
         .eq('user_id', user?.id)
         .single();
       
       if (error) throw error;
       return data;
     },
     enabled: !!user?.id,
   });
 
   // Fetch prescriptions
   const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
     queryKey: ['patient-prescriptions', patientUser?.patient_id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('prescriptions')
        .select('*')
         .eq('patient_id', patientUser?.patient_id)
         .order('created_at', { ascending: false });
       
       if (error) throw error;
       return data;
     },
     enabled: !!patientUser?.patient_id,
   });
 
   // Fetch appointments
   const { data: appointments, isLoading: appointmentsLoading } = useQuery({
     queryKey: ['patient-appointments', patientUser?.patient_id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('appointments')
        .select('*')
         .eq('patient_id', patientUser?.patient_id)
         .order('appointment_date', { ascending: false });
       
       if (error) throw error;
       return data;
     },
     enabled: !!patientUser?.patient_id,
   });
 
   // Fetch medical reports
   const { data: medicalReports, isLoading: reportsLoading } = useQuery({
     queryKey: ['patient-medical-reports', patientUser?.patient_id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('patient_medical_reports')
         .select('*')
         .eq('patient_id', patientUser?.patient_id)
         .order('created_at', { ascending: false });
       
       if (error) throw error;
       return data;
     },
     enabled: !!patientUser?.patient_id,
   });
 
   const handleDownloadPrescription = async (prescription: any) => {
     setDownloadingId(prescription.id);
     try {
       // Fetch doctor details
      const { data: doctorData } = await supabase
         .from('doctors')
        .select('*')
         .eq('id', prescription.doctor_id)
         .single();

      // Fetch doctor profile
      const { data: profileData } = doctorData ? await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', doctorData.user_id)
        .single() : { data: null };
 
       // Fetch patient details
       const { data: patient } = await supabase
         .from('patients')
         .select('*')
         .eq('id', prescription.patient_id)
         .single();
 
      if (!doctorData || !patient) {
         throw new Error('Could not fetch details');
       }
 
      const doctor = {
        name: profileData?.name || 'Doctor',
        clinic_name: doctorData.clinic_name || 'Clinic',
        clinic_address: doctorData.clinic_address || '',
        qualification: doctorData.qualification,
        registration_no: doctorData.registration_no,
        specialization: doctorData.specialization,
       };
 
       const patientData = {
         name: patient.name,
        patient_id: patient.patient_id,
         age: patient.age,
         gender: patient.gender,
        mobile: patient.mobile,
        address: patient.address,
       };
 
       await generatePrescriptionPDF(
         prescription,
         patientData,
        doctor,
         'en'
       );
 
       toast({
         title: 'Success',
         description: 'Prescription downloaded successfully',
       });
     } catch (error) {
       console.error('Error downloading prescription:', error);
       toast({
         title: 'Error',
         description: 'Failed to download prescription',
         variant: 'destructive',
       });
     } finally {
       setDownloadingId(null);
     }
   };
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/patient-auth');
   };
 
   if (patientUserLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   const patientName = patientUser?.patients?.name || user?.user_metadata?.name || 'Patient';
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
         <div className="flex h-16 items-center justify-between px-4 md:px-6">
           <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
               <User className="h-5 w-5 text-primary-foreground" />
             </div>
             <div>
               <h1 className="text-lg font-semibold">Welcome, {patientName}</h1>
               <p className="text-sm text-muted-foreground">Patient Portal</p>
             </div>
           </div>
           <Button variant="outline" onClick={handleSignOut} className="gap-2">
             <LogOut className="h-4 w-4" />
             Logout
           </Button>
         </div>
       </header>
 
       <main className="container max-w-6xl mx-auto p-4 md:p-6">
         {!patientUser?.patient_id ? (
           <Card className="mt-8">
             <CardHeader className="text-center">
               <CardTitle>Account Not Linked</CardTitle>
               <CardDescription>
                 Your account is not yet linked to a patient record. Please contact your doctor's clinic with your registered mobile number ({patientUser?.mobile}) to link your account.
               </CardDescription>
             </CardHeader>
           </Card>
         ) : (
           <Tabs defaultValue="prescriptions" className="mt-6">
             <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl">
               <TabsTrigger value="prescriptions" className="gap-2 rounded-lg">
                 <FileText className="h-4 w-4" />
                 <span className="hidden sm:inline">Prescriptions</span>
               </TabsTrigger>
               <TabsTrigger value="appointments" className="gap-2 rounded-lg">
                 <Calendar className="h-4 w-4" />
                 <span className="hidden sm:inline">Appointments</span>
               </TabsTrigger>
               <TabsTrigger value="reports" className="gap-2 rounded-lg">
                 <Activity className="h-4 w-4" />
                 <span className="hidden sm:inline">Reports</span>
               </TabsTrigger>
             </TabsList>
 
             {/* Prescriptions Tab */}
             <TabsContent value="prescriptions" className="mt-6 space-y-4">
               {prescriptionsLoading ? (
                 <div className="flex justify-center py-8">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
               ) : prescriptions && prescriptions.length > 0 ? (
                 prescriptions.map((prescription: any) => (
                   <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                     <CardContent className="p-4">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <FileText className="h-4 w-4 text-primary" />
                             <span className="font-semibold">{prescription.prescription_no}</span>
                           </div>
                           <p className="text-sm text-muted-foreground">
                             {format(new Date(prescription.created_at), 'dd MMM yyyy')}
                           </p>
                           {prescription.diagnosis && (
                             <p className="text-sm">
                               <span className="text-muted-foreground">Diagnosis:</span> {prescription.diagnosis}
                             </p>
                           )}
                         </div>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDownloadPrescription(prescription)}
                           disabled={downloadingId === prescription.id}
                           className="gap-2"
                         >
                           {downloadingId === prescription.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <Download className="h-4 w-4" />
                           )}
                           Download PDF
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 ))
               ) : (
                 <Card>
                   <CardContent className="p-8 text-center text-muted-foreground">
                     <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>No prescriptions found</p>
                   </CardContent>
                 </Card>
               )}
             </TabsContent>
 
             {/* Appointments Tab */}
             <TabsContent value="appointments" className="mt-6 space-y-4">
               {appointmentsLoading ? (
                 <div className="flex justify-center py-8">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
               ) : appointments && appointments.length > 0 ? (
                 appointments.map((appointment: any) => (
                   <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                     <CardContent className="p-4">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <Calendar className="h-4 w-4 text-primary" />
                             <span className="font-semibold">
                               {format(new Date(appointment.appointment_date), 'dd MMM yyyy')}
                             </span>
                             <Badge variant="outline">{appointment.time_slot}</Badge>
                           </div>
                           <p className="text-sm text-muted-foreground">
                             {appointment.doctors?.profiles?.name || 'Doctor'}
                           </p>
                           {appointment.notes && (
                             <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                           )}
                         </div>
                         <Badge
                           variant={
                             appointment.status === 'completed'
                               ? 'default'
                               : appointment.status === 'cancelled'
                               ? 'destructive'
                               : 'secondary'
                           }
                         >
                           {appointment.status}
                         </Badge>
                       </div>
                     </CardContent>
                   </Card>
                 ))
               ) : (
                 <Card>
                   <CardContent className="p-8 text-center text-muted-foreground">
                     <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>No appointments found</p>
                   </CardContent>
                 </Card>
               )}
             </TabsContent>
 
             {/* Medical Reports Tab */}
             <TabsContent value="reports" className="mt-6 space-y-4">
               {reportsLoading ? (
                 <div className="flex justify-center py-8">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
               ) : medicalReports && medicalReports.length > 0 ? (
                 medicalReports.map((report: any) => (
                   <Card key={report.id} className="hover:shadow-md transition-shadow">
                     <CardContent className="p-4">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <Activity className="h-4 w-4 text-primary" />
                             <span className="font-semibold">{report.file_name}</span>
                             <Badge variant="outline">{report.report_type}</Badge>
                           </div>
                           <p className="text-sm text-muted-foreground">
                             {format(new Date(report.created_at), 'dd MMM yyyy')}
                           </p>
                           {report.notes && (
                             <p className="text-sm text-muted-foreground">{report.notes}</p>
                           )}
                         </div>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => window.open(report.file_url, '_blank')}
                           className="gap-2"
                         >
                           <Download className="h-4 w-4" />
                           View Report
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 ))
               ) : (
                 <Card>
                   <CardContent className="p-8 text-center text-muted-foreground">
                     <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>No medical reports found</p>
                   </CardContent>
                 </Card>
               )}
             </TabsContent>
           </Tabs>
         )}
       </main>
     </div>
   );
 };
 
 export default PatientPortal;