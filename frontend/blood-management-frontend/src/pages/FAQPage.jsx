import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQPage = () => {
  const faqs = [
    {
      question: "Who can donate blood?",
      answer: "Generally, healthy individuals aged 18-65, weighing at least 45kg, can donate blood. Specific eligibility criteria may vary based on medical history and current health status."
    },
    {
      question: "How often can I donate blood?",
      answer: "You can donate whole blood every 56 days (8 weeks). This allows your body time to replenish the donated blood cells."
    },
    {
      question: "Is blood donation safe?",
      answer: "Yes, blood donation is very safe. We use sterile, single-use equipment for each donor, and all procedures follow strict medical guidelines."
    },
    {
      question: "How long does the donation process take?",
      answer: "The entire process typically takes 45-60 minutes, including registration, medical screening, donation (8-10 minutes), and recovery time."
    },
    {
      question: "What should I do before donating blood?",
      answer: "Eat a healthy meal, drink plenty of water, get adequate sleep, and avoid alcohol 24 hours before donation."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about blood donation and our platform.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

