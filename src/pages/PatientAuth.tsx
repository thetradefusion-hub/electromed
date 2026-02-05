 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useToast } from '@/hooks/use-toast';
 import { User, Loader2, ArrowLeft } from 'lucide-react';
 import { z } from 'zod';
 import { Link } from 'react-router-dom';
 
 const loginSchema = z.object({
   email: z.string().email('कृपया सही email डालें'),
   password: z.string().min(6, 'Password कम से कम 6 characters का होना चाहिए'),
 });
 
 const signupSchema = z.object({
   name: z.string().min(2, 'नाम कम से कम 2 characters का होना चाहिए'),
   email: z.string().email('कृपया सही email डालें'),
   password: z.string().min(6, 'Password कम से कम 6 characters का होना चाहिए'),
   phone: z.string().min(10, 'कृपया सही mobile number डालें'),
 });
 
 const PatientAuth = () => {
   const navigate = useNavigate();
   const { user, role, signIn, signUpPatient, loading: authLoading } = useAuth();
   const { toast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   // Login form state
   const [loginEmail, setLoginEmail] = useState('');
   const [loginPassword, setLoginPassword] = useState('');
 
   // Signup form state
   const [signupName, setSignupName] = useState('');
   const [signupEmail, setSignupEmail] = useState('');
   const [signupPassword, setSignupPassword] = useState('');
   const [signupPhone, setSignupPhone] = useState('');
 
   useEffect(() => {
     if (user && !authLoading) {
       if (role === 'patient') {
         navigate('/patient-portal');
       } else {
         navigate('/');
       }
     }
   }, [user, role, authLoading, navigate]);
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setErrors({});
     
     try {
       loginSchema.parse({ email: loginEmail, password: loginPassword });
     } catch (err) {
       if (err instanceof z.ZodError) {
         const fieldErrors: Record<string, string> = {};
         err.errors.forEach((error) => {
           if (error.path[0]) {
             fieldErrors[`login_${error.path[0]}`] = error.message;
           }
         });
         setErrors(fieldErrors);
         return;
       }
     }
 
     setIsLoading(true);
     const { error } = await signIn(loginEmail, loginPassword);
     setIsLoading(false);
 
     if (error) {
       toast({
         title: 'Login Failed',
         description: error.message === 'Invalid login credentials' 
           ? 'गलत email या password। कृपया दोबारा प्रयास करें।'
           : error.message,
         variant: 'destructive',
       });
     } else {
       toast({
         title: 'स्वागत है!',
         description: 'आप सफलतापूर्वक login हो गए।',
       });
     }
   };
 
   const handleSignup = async (e: React.FormEvent) => {
     e.preventDefault();
     setErrors({});
 
     const signupData = {
       name: signupName,
       email: signupEmail,
       password: signupPassword,
       phone: signupPhone,
     };
 
     try {
       signupSchema.parse(signupData);
     } catch (err) {
       if (err instanceof z.ZodError) {
         const fieldErrors: Record<string, string> = {};
         err.errors.forEach((error) => {
           if (error.path[0]) {
             fieldErrors[`signup_${error.path[0]}`] = error.message;
           }
         });
         setErrors(fieldErrors);
         return;
       }
     }
 
     setIsLoading(true);
     const { error } = await signUpPatient(signupEmail, signupPassword, {
       name: signupName,
       phone: signupPhone,
     });
     setIsLoading(false);
 
     if (error) {
       if (error.message.includes('already registered')) {
         toast({
           title: 'Account Exists',
           description: 'इस email से पहले से account है। कृपया login करें।',
           variant: 'destructive',
         });
       } else {
         toast({
           title: 'Signup Failed',
           description: error.message,
           variant: 'destructive',
         });
       }
     } else {
       toast({
         title: 'Account बन गया!',
         description: 'आपका account सफलतापूर्वक बन गया है। कृपया email verify करें।',
       });
     }
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 safe-area-top safe-area-bottom">
       {/* Background decorations */}
       <div className="fixed top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
       <div className="fixed bottom-20 -right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
       
       <Card className="w-full max-w-md relative rounded-2xl border-border/50 shadow-xl">
         {/* Back to landing */}
         <Link to="/landing" className="absolute top-4 left-4 touch-target rounded-xl hover:bg-secondary flex items-center justify-center">
           <ArrowLeft className="h-5 w-5 text-muted-foreground" />
         </Link>
         
         <CardHeader className="text-center pt-12 pb-4">
           <div className="flex justify-center mb-4">
             <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-primary">
               <User className="h-8 w-8 text-white" />
             </div>
           </div>
           <CardTitle className="text-xl sm:text-2xl font-bold">Patient Portal</CardTitle>
           <CardDescription className="text-sm">अपनी prescriptions और appointments देखें</CardDescription>
         </CardHeader>
         <CardContent className="px-4 sm:px-6">
           <Tabs defaultValue="login" className="w-full">
             <TabsList className="grid w-full grid-cols-2 rounded-xl h-11">
               <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
               <TabsTrigger value="signup" className="rounded-lg">Sign Up</TabsTrigger>
             </TabsList>
 
             <TabsContent value="login">
               <form onSubmit={handleLogin} className="space-y-4 mt-4">
                 <div className="space-y-2">
                   <Label htmlFor="login-email" className="text-sm">Email</Label>
                   <Input
                     id="login-email"
                     type="email"
                     placeholder="patient@email.com"
                     value={loginEmail}
                     onChange={(e) => setLoginEmail(e.target.value)}
                     required
                     className="h-12 rounded-xl"
                   />
                   {errors.login_email && (
                     <p className="text-xs text-destructive">{errors.login_email}</p>
                   )}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="login-password" className="text-sm">Password</Label>
                   <Input
                     id="login-password"
                     type="password"
                     placeholder="••••••••"
                     value={loginPassword}
                     onChange={(e) => setLoginPassword(e.target.value)}
                     required
                     className="h-12 rounded-xl"
                   />
                   {errors.login_password && (
                     <p className="text-xs text-destructive">{errors.login_password}</p>
                   )}
                 </div>
                 <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={isLoading}>
                   {isLoading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Signing in...
                     </>
                   ) : (
                     'Login करें'
                   )}
                 </Button>
               </form>
             </TabsContent>
 
             <TabsContent value="signup">
               <form onSubmit={handleSignup} className="space-y-4 mt-4">
                 <div className="space-y-2">
                   <Label htmlFor="signup-name" className="text-sm">पूरा नाम *</Label>
                   <Input
                     id="signup-name"
                     placeholder="आपका नाम"
                     value={signupName}
                     onChange={(e) => setSignupName(e.target.value)}
                     required
                     className="h-11 rounded-xl"
                   />
                   {errors.signup_name && (
                     <p className="text-xs text-destructive">{errors.signup_name}</p>
                   )}
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="signup-phone" className="text-sm">Mobile Number *</Label>
                   <Input
                     id="signup-phone"
                     type="tel"
                     placeholder="9876543210"
                     value={signupPhone}
                     onChange={(e) => setSignupPhone(e.target.value)}
                     required
                     className="h-11 rounded-xl"
                   />
                   {errors.signup_phone && (
                     <p className="text-xs text-destructive">{errors.signup_phone}</p>
                   )}
                   <p className="text-xs text-muted-foreground">
                     वही mobile number डालें जो doctor के पास registered है
                   </p>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="signup-email" className="text-sm">Email *</Label>
                   <Input
                     id="signup-email"
                     type="email"
                     placeholder="patient@email.com"
                     value={signupEmail}
                     onChange={(e) => setSignupEmail(e.target.value)}
                     required
                     className="h-11 rounded-xl"
                   />
                   {errors.signup_email && (
                     <p className="text-xs text-destructive">{errors.signup_email}</p>
                   )}
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="signup-password" className="text-sm">Password *</Label>
                   <Input
                     id="signup-password"
                     type="password"
                     placeholder="••••••••"
                     value={signupPassword}
                     onChange={(e) => setSignupPassword(e.target.value)}
                     required
                     className="h-11 rounded-xl"
                   />
                   {errors.signup_password && (
                     <p className="text-xs text-destructive">{errors.signup_password}</p>
                   )}
                 </div>
 
                 <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={isLoading}>
                   {isLoading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Account बना रहे हैं...
                     </>
                   ) : (
                     'Account बनाएं'
                   )}
                 </Button>
               </form>
             </TabsContent>
           </Tabs>
         </CardContent>
         <CardFooter className="text-center text-xs text-muted-foreground px-4 sm:px-6 pb-6">
           <p className="w-full">
             आपका data सुरक्षित है। केवल आपके doctor ही आपकी जानकारी देख सकते हैं।
             <br />
             <Link to="/auth" className="font-medium text-primary hover:underline">
               Doctor/Staff Login →
             </Link>
           </p>
         </CardFooter>
       </Card>
     </div>
   );
 };
 
 export default PatientAuth;