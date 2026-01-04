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
  Zap,
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
  Clock,
  TrendingUp,
  Globe
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Complete patient records with history, prescriptions, and follow-ups in one place.',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      icon: Brain,
      title: 'AI Report Analysis',
      description: 'Upload medical reports and get instant AI-powered insights and recommendations.',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      icon: FileText,
      title: 'Smart Prescriptions',
      description: 'Generate professional prescriptions with symptom-medicine mapping rules.',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Online booking system with availability management and reminders.',
      color: 'bg-orange-500/10 text-orange-500'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integration',
      description: 'Share prescriptions directly with patients via WhatsApp.',
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      icon: Globe,
      title: 'Bilingual Support',
      description: 'Full Hindi + English language support for better accessibility.',
      color: 'bg-indigo-500/10 text-indigo-500'
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
        'Dedicated Account Manager',
        'Unlimited AI Analyses',
        'API Access',
        'SSO Integration',
        'Custom Development'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Homoeopathy Specialist, Delhi',
      image: null,
      content: 'ElectroMed has transformed how I manage my clinic. The AI report analysis saves me hours every week, and my patients love the WhatsApp prescriptions.',
      rating: 5
    },
    {
      name: 'Dr. Priya Patel',
      role: 'General Physician, Mumbai',
      image: null,
      content: 'The bilingual support is fantastic! My staff can work in Hindi while I use English. The prescription templates are a game-changer.',
      rating: 5
    },
    {
      name: 'Dr. Anil Kumar',
      role: 'Clinic Owner, Bangalore',
      image: null,
      content: 'We switched from paper records to ElectroMed and never looked back. Managing 3 doctors and 500+ patients is now effortless.',
      rating: 5
    },
    {
      name: 'Dr. Sunita Verma',
      role: 'Pediatrician, Jaipur',
      image: null,
      content: 'The appointment booking system has reduced no-shows by 40%. Parents can easily book and get reminders automatically.',
      rating: 5
    }
  ];

  const stats = [
    { value: '5,000+', label: 'Doctors Trust Us' },
    { value: '50L+', label: 'Prescriptions Generated' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ElectroMed</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Homoeopathy Clinic Software</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-4">
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground">Testimonials</a>
            <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground">Contact</a>
            <div className="pt-4 space-y-2">
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/auth" className="block">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              #1 Clinic Management Software for Doctors
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Manage Your Clinic{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Smarter
              </span>
              , Not Harder
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              All-in-one platform for patient management, AI-powered diagnostics, 
              digital prescriptions, and appointment booking. Start your 14-day free trial today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-lg px-8 h-14 w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14">
                <Phone className="h-5 w-5" />
                Book a Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              ✓ No credit card required &nbsp; ✓ 14-day free trial &nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Run Your Clinic
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From patient records to AI diagnostics, we've got you covered with powerful features designed specifically for doctors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your practice. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden ${
                  plan.popular 
                    ? 'border-primary shadow-xl scale-105 z-10' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className={plan.popular ? 'pt-12' : ''}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      or ₹{plan.yearlyPrice}/year (save 17%)
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth" className="block pt-4">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by Doctors Across India
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what healthcare professionals are saying about ElectroMed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join 5,000+ doctors who trust ElectroMed for their clinic management.
            Start your free 14-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 h-14">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14 bg-transparent text-white border-white hover:bg-white/10">
              <Phone className="h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground">+91 98765 43210</p>
              <p className="text-sm text-muted-foreground">Mon-Sat, 9am-6pm IST</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground">support@electromed.in</p>
              <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground">New Delhi, India</p>
              <p className="text-sm text-muted-foreground">By appointment only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ElectroMed</h1>
                <p className="text-xs text-muted-foreground">Homoeopathy Clinic Software</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Refund Policy</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ElectroMed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
