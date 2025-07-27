import React from 'react';
import { Heart, Users, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Blood Management System</h1>
          <p className="text-xl text-muted-foreground">
            Connecting donors with those in need, saving lives one donation at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To create a seamless, efficient, and reliable blood management system that connects 
                voluntary blood donors with patients in need, ensuring that no life is lost due to 
                blood shortage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-600" />
                <span>Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To build a world where blood is readily available for every patient who needs it, 
                through a network of compassionate donors and efficient healthcare systems.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground">
                All donations are thoroughly tested and stored under optimal conditions following 
                international safety standards.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Built by the community, for the community. Every donation and request helps 
                strengthen our network of care.
              </p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Proven Impact</h3>
              <p className="text-muted-foreground">
                Thousands of lives saved through our platform, with a growing network of 
                donors and healthcare partners.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              The Blood Management System was born out of a simple yet powerful idea: that technology 
              can bridge the gap between those who can give and those who need. Founded in 2024, our 
              platform has grown to become a trusted network connecting donors, recipients, and 
              healthcare providers.
            </p>
            <p>
              We understand that every second counts in medical emergencies, and every drop of blood 
              donated can make the difference between life and death. That's why we've built a system 
              that prioritizes speed, reliability, and transparency in blood donation and distribution.
            </p>
            <p>
              Our team consists of healthcare professionals, technology experts, and passionate 
              volunteers who believe in the power of community-driven healthcare solutions. Together, 
              we're working towards a future where blood shortage is a thing of the past.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;

