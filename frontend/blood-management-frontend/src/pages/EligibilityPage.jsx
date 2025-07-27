import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EligibilityPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Blood Donation Eligibility</h1>
          <p className="text-xl text-muted-foreground">
            Check if you're eligible to donate blood and save lives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>You CAN donate if you:</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Are aged 18-65 years</li>
                <li>• Weigh at least 45 kg (99 lbs)</li>
                <li>• Are in good general health</li>
                <li>• Have normal blood pressure</li>
                <li>• Have adequate hemoglobin levels</li>
                <li>• Haven't donated blood in the last 56 days</li>
                <li>• Are well-rested and hydrated</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>You CANNOT donate if you:</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Have a cold, flu, or fever</li>
                <li>• Are pregnant or breastfeeding</li>
                <li>• Have certain medical conditions</li>
                <li>• Are taking certain medications</li>
                <li>• Have recently traveled to certain areas</li>
                <li>• Have had recent tattoos or piercings</li>
                <li>• Have consumed alcohol in the last 24 hours</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is a general guide. Final eligibility is determined during the medical screening 
              process at the donation center. Our medical staff will conduct a thorough health 
              assessment before each donation.
            </p>
            <p className="text-muted-foreground">
              If you have any specific medical conditions or concerns, please consult with our 
              medical team or your healthcare provider before donating.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EligibilityPage;

