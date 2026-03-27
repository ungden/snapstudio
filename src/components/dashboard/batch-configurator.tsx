"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Minus, Eye, User, Share2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/safe-image";

type ImageType = 'display' | 'model' | 'social' | 'seeding';

interface BatchConfiguratorProps {
  batchConfig: Record<ImageType, number>;
  onConfigChange: (type: ImageType, delta: number) => void;
  exampleImages: Record<ImageType, string | null>;
  totalSelected: number;
}

const BATCH_CONFIG_TYPES: { id: ImageType; name: string; icon: React.ElementType }[] = [
  { id: 'display', name: 'Display', icon: Eye },
  { id: 'model', name: 'Model', icon: User },
  { id: 'social', name: 'Social', icon: Share2 },
  { id: 'seeding', name: 'Seeding', icon: Users },
];

export function BatchConfigurator({ batchConfig, onConfigChange, exampleImages, totalSelected }: BatchConfiguratorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Configure 12-image set
          </div>
          <Badge className={cn(
            totalSelected === 12 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {totalSelected} / 12 images
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BATCH_CONFIG_TYPES.map(({ id, name, icon: Icon }) => (
          <div key={id} className="p-3 border rounded-lg text-center space-y-2">
            <div className="aspect-square w-full bg-gray-100 rounded-md mb-2 overflow-hidden">
              <SafeImage 
                src={exampleImages[id]} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Icon className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-sm">{name}</h4>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="p-2 h-8 w-8" 
                onClick={() => onConfigChange(id, -1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{batchConfig[id]}</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="p-2 h-8 w-8" 
                onClick={() => onConfigChange(id, 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}