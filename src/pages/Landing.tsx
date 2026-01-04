import { useState } from 'react';
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
  Globe
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Complete patient records with history, prescriptions, and follow-ups in one place.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Brain,
      title: 'AI Report Analysis',
      description: 'Upload medical reports and get instant AI-powered insights and recommendations.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: FileText,
      title: 'Smart Prescriptions',
      description: 'Generate professional prescriptions with symptom-medicine mapping rules.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Online booking system with availability management and reminders.',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integration',
      description: 'Share prescriptions directly with patients via WhatsApp.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Globe,
      title: 'Bilingual Support',
      description: 'Full Hindi + English language support for better accessibility.',
      gradient: 'from-indigo-500 to-blue-600'
    }
  ];

  const plans = [
    {
      name: 'Basic',
      price: '999',
      yearlyPrice: '9,990',
      description: 'Perfect for individual doctors starting their digital journey',
      features: [
        '1 Doctor Account',
        'Up to 100 Patients',
        'Basic Prescriptions',
        'Appointment Booking',
        'Email Support',
        '10 AI Report Analyses/month'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: '2,499',
      yearlyPrice: '24,990',
      description: 'Best for growing clinics with multiple services',
      features: [
        'Up to 3 Doctors',
        'Unlimited Patients',
        'AI Report Analysis',
        'WhatsApp Sharing',
        'Priority Support',
        '50 AI Analyses/month',
        'Custom Branding',
        'Analytics Dashboard'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: '4,999',
      yearlyPrice: '49,990',
      description: 'For hospitals and multi-branch clinics',
      features: [
        'Unlimited Doctors',
        'Unlimited Everything',
        'Multi-branch Support',
        'Custom Branding',
        'Dedicated Manager',
        'Unlimited AI Analyses',
        'API Access',
        'SSO Integration'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Homoeopathy Specialist, Delhi',
      content: 'ElectroMed has transformed how I manage my clinic. The AI report analysis saves me hours every week.',
      rating: 5
    },
    {
      name: 'Dr. Priya Patel',
      role: 'General Physician, Mumbai',
      content: 'The bilingual support is fantastic! My staff can work in Hindi while I use English.',
      rating: 5
    },
    {
      name: 'Dr. Anil Kumar',
      role: 'Clinic Owner, Bangalore',
      content: 'Managing 3 doctors and 500+ patients is now effortless. Highly recommended!',
      rating: 5
    },
    {
      name: 'Dr. Sunita Verma',
      role: 'Pediatrician, Jaipur',
      content: 'The appointment booking system has reduced no-shows by 40%. Amazing experience.',
      rating: 5
    }
  ];

  const stats = [
    { value: '5,000+', label: 'Doctors Trust Us' },
    { value: '50L+', label: 'Prescriptions' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-primary">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ElectroMed</h1>
                <p className="text-[10px] text-muted-foreground hidden sm:block">Homoeopathy Clinic Software</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gap-2 rounded-xl">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden touch-target rounded-xl hover:bg-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl p-4 space-y-3 animate-slide-up">
            <a href="#features" className="block py-2 text-base text-foreground font-medium">Features</a>
            <a href="#pricing" className="block py-2 text-base text-foreground font-medium">Pricing</a>
            <a href="#testimonials" className="block py-2 text-base text-foreground font-medium">Reviews</a>
            <a href="#contact" className="block py-2 text-base text-foreground font-medium">Contact</a>
            <div className="pt-4 space-y-3 border-t border-border">
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full rounded-xl h-12">Login</Button>
              </Link>
              <Link to="/auth" className="block">
                <Button className="w-full rounded-xl h-12">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 sm:mb-6 px-4 py-2 text-xs sm:text-sm rounded-full" variant="secondary">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              #1 Clinic Management Software
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6 text-balance">
              Manage Your Clinic{' '}
              <span className="gradient-text">
                Smarter
              </span>
              , Not Harder
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-balance">
              All-in-one platform for patient management, AI-powered diagnostics, 
              digital prescriptions, and appointment booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto rounded-xl">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 rounded-xl">
                <Phone className="h-5 w-5" />
                Book Demo
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              ✓ No credit card &nbsp; ✓ 14-day free trial &nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 rounded-full" variant="outline">Features</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 text-balance">
              Everything You Need to Run Your Clinic
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for doctors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm sm:text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 rounded-full" variant="outline">Pricing</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden rounded-2xl ${
                  plan.popular 
                    ? 'border-primary shadow-xl md:scale-105 z-10' 
                    : 'border-border/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 gradient-primary text-white text-center py-2 text-xs sm:text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader className={`${plan.popular ? 'pt-12' : ''} pb-4`}>
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="pt-3">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground">₹{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      or ₹{plan.yearlyPrice}/year (save 17%)
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth" className="block pt-2">
                    <Button 
                      className="w-full rounded-xl h-11" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 rounded-full" variant="outline">Testimonials</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Loved by Doctors Across India
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              See what healthcare professionals are saying about ElectroMed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 text-sm sm:text-base">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-32 gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 text-balance">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8">
            Join 5,000+ doctors who trust ElectroMed.
            Start your free 14-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto rounded-xl">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 bg-transparent text-white border-white/50 hover:bg-white/10 rounded-xl">
              <Phone className="h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
              <p className="text-muted-foreground text-sm">+91 98765 43210</p>
              <p className="text-xs text-muted-foreground">Mon-Sat, 9am-6pm IST</p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
              <p className="text-muted-foreground text-sm">support@electromed.in</p>
              <p className="text-xs text-muted-foreground">We reply within 24 hours</p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Visit Us</h3>
              <p className="text-muted-foreground text-sm">New Delhi, India</p>
              <p className="text-xs text-muted-foreground">By appointment only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">ElectroMed</h1>
                <p className="text-xs text-muted-foreground">Homoeopathy Clinic Software</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Refund Policy</a>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 ElectroMed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
