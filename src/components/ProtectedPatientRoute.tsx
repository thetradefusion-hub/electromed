 import { ReactNode } from 'react';
 import { Navigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { Loader2 } from 'lucide-react';
 
 interface ProtectedPatientRouteProps {
   children: ReactNode;
 }
 
 const ProtectedPatientRoute = ({ children }: ProtectedPatientRouteProps) => {
   const { user, role, loading } = useAuth();
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!user) {
     return <Navigate to="/patient-auth" replace />;
   }
 
   if (role !== 'patient') {
     return <Navigate to="/" replace />;
   }
 
   return <>{children}</>;
 };
 
 export default ProtectedPatientRoute;