import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Get in touch with our team. We're here to help 24/7.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  <span>Emergency Hotline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">+1 (555) 123-4567</p>
                <p className="text-muted-foreground">Available 24/7 for urgent blood requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-red-600" />
                  <span>Email Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">support@bloodbank.com</p>
                <p className="text-muted-foreground">General inquiries and support</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span>Visit Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">123 Healthcare Avenue</p>
                <p className="text-muted-foreground">Medical District, City 12345</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span>Office Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p><span className="font-semibold">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
                  <p><span className="font-semibold">Saturday:</span> 9:00 AM - 4:00 PM</p>
                  <p><span className="font-semibold">Sunday:</span> Emergency only</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  For non-urgent inquiries, please use our contact form or email us directly.
                  We'll get back to you within 24 hours.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">For Donors:</h4>
                    <p className="text-sm text-muted-foreground">
                      Questions about donation eligibility, scheduling, or the donation process.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">For Recipients:</h4>
                    <p className="text-sm text-muted-foreground">
                      Help with blood requests, status updates, or urgent needs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">For Healthcare Providers:</h4>
                    <p className="text-sm text-muted-foreground">
                      Partnership opportunities, bulk requests, or system integration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

