"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Sparkles, Upload, Wand2 } from 'lucide-react';

const steps = [
  {
    icon: Building2,
    title: "Step 1: Select Industry",
    description: "Choose your industry so AI uses specialized prompts optimized for your products.",
  },
  {
    icon: Sparkles,
    title: "Step 2: Configure Image Set",
    description: "Customize the number of images for each style (Display, Model, Social, Seeding) to total 12.",
  },
  {
    icon: Upload,
    title: "Step 3: Upload Original Image",
    description: "Upload your original product image. It should be clear with the product as the focal point.",
  },
  {
    icon: Wand2,
    title: "Step 4: Generate Image Set",
    description: "Click 'Generate' and wait 30-60 seconds to receive your complete marketing image set.",
  },
];

export function OnboardingGuide() {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-gray-900">
          Create images in 4 steps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 border-2 border-white">
                    {index + 1}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}