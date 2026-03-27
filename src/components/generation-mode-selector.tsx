"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type GenerationMode = 'batch' | 'solo';

interface GenerationModeSelectorProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

export function GenerationModeSelector({ mode, onModeChange }: GenerationModeSelectorProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Choose generation mode
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Mode */}
          <Button
            variant="outline"
            onClick={() => onModeChange('batch')}
            className={cn(
              "h-auto p-6 flex flex-col items-start text-left transition-all",
              mode === 'batch' 
                ? "border-blue-500 bg-blue-50 shadow-md" 
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            <div className="flex items-center gap-3 mb-3 w-full">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">Batch - Custom image set</h4>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Save 60%
                </Badge>
              </div>
              {mode === 'batch' && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Customize 12 images</strong> across 4 styles</p>
              <p>• <strong>120 points</strong> - Super cost-effective with batch processing</p>
              <p>• Ideal for complete marketing campaigns</p>
              <p>• Processing time: 30-60 seconds</p>
            </div>
          </Button>

          {/* Solo Mode */}
          <Button
            variant="outline"
            onClick={() => onModeChange('solo')}
            className={cn(
              "h-auto p-6 flex flex-col items-start text-left transition-all",
              mode === 'solo' 
                ? "border-orange-500 bg-orange-50 shadow-md" 
                : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
            )}
          >
            <div className="flex items-center gap-3 mb-3 w-full">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">Solo - Full customization</h4>
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  Premium
                </Badge>
              </div>
              {mode === 'solo' && (
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>1 image</strong> with your custom prompt</p>
              <p>• <strong>30 points</strong> - Higher cost to encourage Batch mode</p>
              <p>• Maximum flexibility, full control over results</p>
              <p>• Processing time: 10-20 seconds</p>
            </div>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Cost comparison:</p>
              <p>
                <strong>Batch:</strong> 120 points = 12 images → 10 points/image 💰<br/>
                <strong>Solo:</strong> 30 points = 1 image → 30 points/image 💸<br/>
                → <span className="font-bold text-green-600">Batch is 3x cheaper!</span> Use Batch for maximum efficiency.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}