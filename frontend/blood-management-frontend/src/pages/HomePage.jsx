import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Droplets, 
  Clock, 
  Shield, 
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
  const features = [
    {
      icon: Heart,
      title: 'Save Lives',
      description: 'Your blood donation can save up to 3 lives. Be a hero in someone\'s story.',
    },
    {
      icon: Users,
      title: 'Community Network',
      description: 'Join a network of donors and recipients working together to save lives.',
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Emergency blood requests are processed quickly to ensure timely delivery.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All donations are thoroughly tested and stored under optimal conditions.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Lives Saved' },
    { number: '5,000+', label: 'Active Donors' },
    { number: '50+', label: 'Partner Hospitals' },
    { number: '24/7', label: 'Emergency Support' },
  ];

  const bloodTypes = [
    { type: 'O-', description: 'Universal Donor', color: 'bg-red-600' },
    { type: 'O+', description: 'Most Common', color: 'bg-red-500' },
    { type: 'A-', description: 'Rare Type', color: 'bg-blue-600' },
    { type: 'A+', description: 'Common Type', color: 'bg-blue-500' },
    { type: 'B-', description: 'Rare Type', color: 'bg-green-600' },
    { type: 'B+', description: 'Common Type', color: 'bg-green-500' },
    { type: 'AB-', description: 'Rarest Type', color: 'bg-purple-600' },
    { type: 'AB+', description: 'Universal Recipient', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Donate Blood,
              <span className="block text-red-200">Save Lives</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto">
              Join our community of heroes. Every drop counts, every donation matters.
              Be the reason someone gets a second chance at life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth/register">
                  Become a Donor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" asChild>
                <Link to="/auth/register">Request Blood</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-400 bg-opacity-20 rounded-full animate-pulse flex items-center justify-center">
          <Droplets className="h-16 w-16 text-white opacity-30" />
        </div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-red-300 bg-opacity-20 rounded-full animate-pulse flex items-center justify-center">
          <Heart className="h-12 w-12 text-white opacity-30" />
        </div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-red-500 bg-opacity-20 rounded-full animate-pulse flex items-center justify-center">
          <Users className="h-8 w-8 text-white opacity-30" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide a comprehensive blood management system that connects donors,
              recipients, and healthcare providers efficiently and securely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blood Types Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Blood Types We Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every blood type is precious and needed. Find out how your blood type
              can help save lives in your community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bloodTypes.map((blood, index) => (
              <div
                key={index}
                className="bg-background rounded-lg p-6 text-center border border-border hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 ${blood.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-bold text-lg">{blood.type}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{blood.type}</h3>
                <p className="text-sm text-muted-foreground">{blood.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple steps to start saving lives or get the help you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Register</h3>
              <p className="text-muted-foreground">
                Create your account and complete your profile with medical information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Donate or Request</h3>
              <p className="text-muted-foreground">
                Schedule a donation appointment or submit a blood request for patients in need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Save Lives</h3>
              <p className="text-muted-foreground">
                Your contribution helps save lives and makes a real difference in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-red-100 max-w-2xl mx-auto">
            Join thousands of donors who are already saving lives.
            Your journey to becoming a hero starts with a single click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth/register">
                Start Donating Today
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" asChild>
              <Link to="/eligibility">Check Eligibility</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need Help?
            </h2>
            <p className="text-xl text-muted-foreground">
              Our team is here to support you 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Phone className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Emergency Hotline</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Mail className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground">support@bloodbank.com</p>
            </div>
            
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-muted-foreground">123 Healthcare Ave, Medical District</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

