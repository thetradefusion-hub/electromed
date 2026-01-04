import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import PatientHistory from "./pages/PatientHistory";
import Consultation from "./pages/Consultation";
import Prescriptions from "./pages/Prescriptions";
import Medicines from "./pages/Medicines";
import Rules from "./pages/Rules";
import FollowUps from "./pages/FollowUps";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SuperAdmin from "./pages/SuperAdmin";
import SaasAdmin from "./pages/SaasAdmin";
import Landing from "./pages/Landing";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import Symptoms from "./pages/Symptoms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor', 'staff']}>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor', 'staff']}>
                  <NewPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/history"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor', 'staff']}>
                  <PatientHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultation"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor']}>
                  <Consultation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor']}>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medicines"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor']}>
                  <Medicines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/symptoms"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor']}>
                  <Symptoms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rules"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor']}>
                  <Rules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/followups"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor', 'staff']}>
                  <FollowUps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saas-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SaasAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'doctor', 'staff']}>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
