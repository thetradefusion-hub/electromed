import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  FileText, 
  Users, 
  Brain, 
  Calendar, 
  MessageSquare,
  Shield,
  Check,
  Star,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  Globe,
  Zap,
  Heart,
  TrendingUp,
  Award,
  Play,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Smart Patient Records',
      description: 'Complete patient history with AI-powered insights and predictive health analytics.',
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      delay: '0ms'
    },
    {
      icon: Brain,
      title: 'AI Diagnostics',
      description: 'Upload reports and get instant AI analysis with treatment recommendations.',
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
      delay: '100ms'
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Generate branded e-prescriptions with auto symptom-medicine mapping.',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      delay: '200ms'
    },
    {
      icon: Calendar,
      title: 'Appointment Hub',
      description: 'Smart scheduling with automated reminders and waitlist management.',
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      delay: '300ms'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Connect',
      description: 'Share prescriptions and appointment updates instantly via WhatsApp.',
      gradient: 'from-green-500 via-emerald-600 to-teal-700',
      delay: '400ms'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'HIPAA compliant with end-to-end encryption and secure cloud storage.',
      gradient: 'from-slate-600 via-slate-700 to-zinc-800',
      delay: '500ms'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '999',
      yearlyPrice: '9,990',
      description: 'Perfect for solo practitioners',
      features: [
        '1 Doctor Account',
        'Up to 100 Patients',
        'Digital Prescriptions',
        'Basic Appointments',
        'Email Support',
        '10 AI Analyses/month'
      ],
      popular: false,
      cta: 'Start Free Trial',
      icon: Zap
    },
    {
      name: 'Professional',
      price: '2,499',
      yearlyPrice: '24,990',
      description: 'Best for growing clinics',
      features: [
        'Up to 3 Doctors',
        'Unlimited Patients',
        'AI Report Analysis',
        'WhatsApp Integration',
        'Priority Support',
        '100 AI Analyses/month',
        'Custom Branding',
        'Analytics Dashboard'
      ],
      popular: true,
      cta: 'Start Free Trial',
      icon: TrendingUp
    },
    {
      name: 'Enterprise',
      price: '4,999',
      yearlyPrice: '49,990',
      description: 'For hospitals & chains',
      features: [
        'Unlimited Doctors',
        'Unlimited Everything',
        'Multi-branch Support',
        'White-label Solution',
        'Dedicated Manager',
        'Unlimited AI Analyses',
        'API Access',
        'SSO & LDAP'
      ],
      popular: false,
      cta: 'Contact Sales',
      icon: Award
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Homoeopathy Specialist',
      location: 'Delhi',
      content: 'ElectroMed has transformed my clinic operations. The AI analysis saves me 3+ hours daily. My patients love the digital prescriptions!',
      rating: 5,
      image: 'RS'
    },
    {
      name: 'Dr. Priya Patel',
      role: 'General Physician',
      location: 'Mumbai',
      content: 'The Hindi language support is amazing! My staff finds it incredibly easy to use. Best investment for my practice.',
      rating: 5,
      image: 'PP'
    },
    {
      name: 'Dr. Anil Kumar',
      role: 'Clinic Director',
      location: 'Bangalore',
      content: 'Managing 5 doctors and 1000+ patients is now seamless. The analytics help me make better business decisions.',
      rating: 5,
      image: 'AK'
    },
    {
      name: 'Dr. Sunita Verma',
      role: 'Pediatrician',
      location: 'Jaipur',
      content: 'Appointment no-shows reduced by 50% with automated reminders. The ROI is incredible!',
      rating: 5,
      image: 'SV'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Doctors', icon: Users },
    { value: '1 Cr+', label: 'Prescriptions', icon: FileText },
    { value: '99.99%', label: 'Uptime', icon: Zap },
    { value: '4.9/5', label: 'Rating', icon: Star }
  ];

  const trustedBy = [
    'Apollo Clinics', 'Medanta', 'Fortis', 'Max Healthcare', 'AIIMS Doctors'
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-accent shadow-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">ElectroMed</h1>
                <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">AI-Powered Clinic Software</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                Reviews
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="font-semibold">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="gap-2 rounded-xl px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden touch-target rounded-xl hover:bg-secondary/80 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border p-6 space-y-4 animate-slide-up shadow-xl">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-3 text-lg font-semibold text-foreground hover:text-primary transition-colors">
              Features <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-3 text-lg font-semibold text-foreground hover:text-primary transition-colors">
              Pricing <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-3 text-lg font-semibold text-foreground hover:text-primary transition-colors">
              Reviews <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-3 text-lg font-semibold text-foreground hover:text-primary transition-colors">
              Contact <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
            <div className="pt-6 space-y-3 border-t border-border">
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl h-14 text-base font-semibold">Login</Button>
              </Link>
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl h-14 text-base font-semibold gap-2 shadow-lg">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-[150px]" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-32 left-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/10 hidden lg:flex items-center justify-center animate-bounce-soft" style={{ animationDuration: '3s' }}>
          <Heart className="w-7 h-7 text-blue-500" />
        </div>
        <div className="absolute top-48 right-20 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-white/10 hidden lg:flex items-center justify-center animate-bounce-soft" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          <FileText className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="absolute bottom-32 left-20 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-white/10 hidden lg:flex items-center justify-center animate-bounce-soft" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <Zap className="w-5 h-5 text-orange-500" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6 lg:mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">#1 Rated Clinic Management Software in India</span>
              <Badge className="bg-primary/20 text-primary border-0 text-xs">NEW</Badge>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6 lg:mb-8 tracking-tight animate-slide-up">
              Manage Your Clinic
              <span className="block mt-2">
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-violet-500 to-accent bg-clip-text text-transparent">
                    10x Faster
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              AI-powered patient management, smart prescriptions, and seamless appointments — 
              <span className="text-foreground font-semibold"> all in one beautiful platform.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/auth">
                <Button size="lg" className="gap-3 text-base lg:text-lg px-8 h-14 lg:h-16 w-full sm:w-auto rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-3 text-base lg:text-lg px-8 h-14 lg:h-16 rounded-2xl border-2 hover:bg-secondary/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Play className="h-4 w-4 text-primary fill-primary" />
                </div>
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                No credit card
              </span>
              <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                14-day free trial
              </span>
              <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 lg:mt-20 relative animate-scale-in" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/70" />
                    <div className="w-3 h-3 rounded-full bg-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-accent/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-background rounded-lg text-xs text-muted-foreground">
                      electromed.app/dashboard
                    </div>
                  </div>
                </div>
                <div className="p-6 lg:p-8 bg-gradient-to-br from-background to-secondary/30">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Today's Patients", value: '24', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Prescriptions', value: '18', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { label: 'Appointments', value: '12', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                      { label: 'Revenue', value: '₹24K', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' }
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-card border border-border/50">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 lg:h-40 bg-gradient-to-br from-secondary/50 to-secondary rounded-2xl flex items-center justify-center border border-border/30">
                    <p className="text-muted-foreground text-sm">Interactive Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 lg:py-16 border-y border-border/50 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">TRUSTED BY DOCTORS FROM</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {trustedBy.map((brand, index) => (
              <div key={index} className="text-lg lg:text-xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="relative group p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-card to-secondary/30 border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm lg:text-base text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 lg:mb-20">
            <Badge className="mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary border-primary/20" variant="outline">
              <Zap className="h-3 w-3 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Everything You Need,
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by doctors, for doctors. Every feature is designed to save you time and help you focus on what matters — your patients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative border-border/50 hover:border-primary/30 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-4 relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl lg:text-2xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base lg:text-lg leading-relaxed">{feature.description}</CardDescription>
                  <div className="mt-4 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowUpRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-32 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 lg:mb-20">
            <Badge className="mb-4 px-4 py-2 rounded-full bg-accent/10 text-accent border-accent/20" variant="outline">
              <Heart className="h-3 w-3 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free for 14 days. No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-2xl shadow-primary/20 lg:scale-105 z-10' 
                    : 'border-border/50 hover:border-primary/30 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2.5 text-sm font-bold tracking-wide">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <CardHeader className={`${plan.popular ? 'pt-14' : ''} pb-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-primary to-accent' 
                        : 'bg-secondary'
                    }`}>
                      <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-foreground'}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-foreground">₹{plan.price}</span>
                      <span className="text-muted-foreground text-lg">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      or ₹{plan.yearlyPrice}/year <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.popular ? 'bg-primary/20' : 'bg-accent/20'
                        }`}>
                          <Check className={`h-3 w-3 ${plan.popular ? 'text-primary' : 'text-accent'}`} />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth" className="block">
                    <Button 
                      className={`w-full rounded-2xl h-14 text-base font-semibold transition-all ${
                        plan.popular 
                          ? 'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 lg:mb-20">
            <Badge className="mb-4 px-4 py-2 rounded-full bg-warning/10 text-warning border-warning/20" variant="outline">
              <Star className="h-3 w-3 mr-2 fill-current" />
              Customer Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Loved by 10,000+ Doctors
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Hear from healthcare professionals who transformed their practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className={`relative border-border/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                  activeTestimonial === index ? 'ring-2 ring-primary/30' : ''
                }`}
              >
                <CardContent className="p-6 lg:p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground text-lg lg:text-xl leading-relaxed mb-6 font-medium">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <span className="text-lg font-bold text-white">{testimonial.image}</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{testimonial.name}</p>
                      <p className="text-muted-foreground">{testimonial.role}, {testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeTestimonial === index 
                    ? 'bg-primary w-8' 
                    : 'bg-border hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white/90 font-medium">Join 10,000+ Happy Doctors</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Ready to Transform
            <span className="block">Your Practice?</span>
          </h2>
          <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start your free trial today. No credit card required. 
            Get up and running in under 5 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-lg px-10 h-16 bg-white text-primary hover:bg-white/90 shadow-2xl rounded-2xl font-bold w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-10 h-16 border-2 border-white/30 text-white hover:bg-white/10 rounded-2xl font-bold backdrop-blur-sm">
              <Phone className="h-5 w-5" />
              Talk to Sales
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/70">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <Badge className="mb-4 rounded-full" variant="outline">Contact Us</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Let's Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Have questions? Our team is here to help. Reach out and we'll get back to you within 24 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Phone Support</p>
                    <p className="text-muted-foreground">+91 98765 43210</p>
                    <p className="text-sm text-muted-foreground">Mon-Sat, 9 AM - 7 PM IST</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Email Us</p>
                    <p className="text-muted-foreground">support@electromed.app</p>
                    <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Office</p>
                    <p className="text-muted-foreground">123 Tech Park, Sector 62</p>
                    <p className="text-muted-foreground">Noida, UP 201301</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardContent className="p-6 lg:p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Send us a message</h3>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                      <input 
                        type="text" 
                        className="medical-input"
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                      <input 
                        type="tel" 
                        className="medical-input"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input 
                      type="email" 
                      className="medical-input"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                    <textarea 
                      rows={4}
                      className="medical-input resize-none"
                      placeholder="Tell us about your clinic..."
                    />
                  </div>
                  <Button className="w-full h-14 rounded-xl text-base font-semibold shadow-lg">
                    Send Message
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 lg:py-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-background">ElectroMed</h3>
                  <p className="text-xs text-background/60">AI-Powered Clinic Software</p>
                </div>
              </div>
              <p className="text-background/70 mb-4">
                India's #1 clinic management software. Trusted by 10,000+ doctors.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-background mb-4">Product</h4>
              <ul className="space-y-3 text-background/70">
                <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-background transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-background transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-background mb-4">Company</h4>
              <ul className="space-y-3 text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-background transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-background mb-4">Legal</h4>
              <ul className="space-y-3 text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-background transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2024 ElectroMed. All rights reserved.
            </p>
            <p className="text-background/60 text-sm flex items-center gap-2">
              Made with <Heart className="h-4 w-4 text-destructive fill-destructive" /> in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
