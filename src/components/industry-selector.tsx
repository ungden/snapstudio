"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Sparkles, Coffee, Heart, Shirt, Baby, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IndustryId = 'f_b' | 'beauty' | 'fashion' | 'mother_baby' | 'other';

export interface Industry {
  id: IndustryId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  examples: string;
}

export const industries: Industry[] = [
  {
    id: 'f_b',
    name: 'Food & Beverage',
    shortName: 'F&B',
    description: 'Food & Beverages',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: Coffee,
    emoji: '🍔',
    examples: 'Dishes, beverages, restaurants'
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    shortName: 'Beauty',
    description: 'Cosmetics & Personal Care',
    color: 'from-pink-500 to-purple-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    icon: Heart,
    emoji: '💄',
    examples: 'Cosmetics, skincare, makeup'
  },
  {
    id: 'fashion',
    name: 'Fashion & Accessories',
    shortName: 'Fashion',
    description: 'Fashion & Accessories',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: Shirt,
    emoji: '👕',
    examples: 'Clothing, shoes, handbags'
  },
  {
    id: 'mother_baby',
    name: 'Mother & Baby',
    shortName: 'Mom & Baby',
    description: 'Mom & Baby',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: Baby,
    emoji: '👶',
    examples: 'Products for mothers and babies'
  },
  {
    id: 'other',
    name: 'Electronics & Home',
    shortName: 'Tech & Home',
    description: 'Electronics & Home Appliances',
    color: 'from-gray-500 to-slate-600',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: Smartphone,
    emoji: '📱',
    examples: 'Electronics, home appliances, technology'
  },
];

interface IndustrySelectorProps {
  selectedIndustry: IndustryId;
  onIndustryChange: (industry: IndustryId) => void;
  className?: string;
}

export function IndustrySelector({ selectedIndustry, onIndustryChange, className }: IndustrySelectorProps) {
  const selectedIndustryInfo = industries.find(ind => ind.id === selectedIndustry);

  const handleIndustryClick = (industryId: string) => {
    // Type guard to ensure industryId is valid
    const validIndustries: IndustryId[] = ['f_b', 'beauty', 'fashion', 'mother_baby', 'other'];
    if (validIndustries.includes(industryId as IndustryId)) {
      onIndustryChange(industryId as IndustryId);
    }
  };

  return (
    <Card className={cn("border-0 shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Select your industry
          </h3>
          <p className="text-gray-600">
            AI will use specialized prompts and display relevant sample images
          </p>
        </div>

        {/* Industry Grid */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {industries.map((industry) => {
            const IndustryIcon = industry.icon;
            return (
              <Button
                key={industry.id}
                variant={selectedIndustry === industry.id ? "default" : "outline"}
                onClick={() => handleIndustryClick(industry.id)}
                className="flex items-center gap-2"
              >
                <IndustryIcon className="w-4 h-4" />
                <span>{industry.shortName}</span>
              </Button>
            );
          })}
        </div>

        {/* Selected Industry Info */}
        {selectedIndustryInfo && (
          <Card className={cn("border-2 shadow-sm", selectedIndustryInfo.bgColor, `border-${selectedIndustryInfo.textColor.split('-')[1]}-200`)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", selectedIndustryInfo.bgColor)}>
                  <selectedIndustryInfo.icon className={cn("w-6 h-6", selectedIndustryInfo.textColor)} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    {selectedIndustryInfo.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedIndustryInfo.examples}
                  </p>
                </div>
                <Badge className={cn("px-3 py-1", selectedIndustryInfo.bgColor, selectedIndustryInfo.textColor)}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Specialized prompts
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}