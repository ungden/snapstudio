"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  productName: string;
  progress: number;
}

const progressStages = [
  { threshold: 0, label: "Initializing", description: "Preparing data and AI prompts", icon: Clock },
  { threshold: 20, label: "Analyzing image", description: "AI is analyzing your original image", icon: Sparkles },
  { threshold: 40, label: "Creating prompts", description: "Optimizing prompts for each image type", icon: Zap },
  { threshold: 60, label: "Rendering images", description: "AI is generating 12 professional images", icon: Loader2 },
  { threshold: 80, label: "Final processing", description: "Adding watermark and optimizing quality", icon: Sparkles },
  { threshold: 100, label: "Complete", description: "Your image set is ready!", icon: CheckCircle }
];

export function GenerationProgress({ productName, progress }: GenerationProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  // Update current stage based on progress
  useEffect(() => {
    const stage = progressStages.findIndex((stage, index) => {
      const nextStage = progressStages[index + 1];
      return displayProgress >= stage.threshold && (!nextStage || displayProgress < nextStage.threshold);
    });
    setCurrentStage(Math.max(0, stage));
  }, [displayProgress]);

  const currentStageInfo = progressStages[currentStage];
  const StageIcon = currentStageInfo?.icon || Loader2;
  const isCompleted = displayProgress >= 100;

  return (
    <Card className={cn(
      "border-2 transition-all duration-500",
      isCompleted ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"
    )}>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <div className={cn(
              "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors",
              isCompleted ? "bg-green-600" : "bg-blue-600"
            )}>
              <StageIcon className={cn(
                "w-8 h-8 text-white",
                currentStageInfo?.icon === Loader2 && "animate-spin"
              )} />
            </div>
            <h3 className={cn(
              "text-2xl font-bold mb-2 transition-colors",
              isCompleted ? "text-green-900" : "text-blue-900"
            )}>
              {isCompleted ? "🎉 Complete!" : "Generating images..."}
            </h3>
            <p className={cn(
              "text-lg transition-colors",
              isCompleted ? "text-green-700" : "text-blue-700"
            )}>
              {isCompleted ? `Image set for "${productName}" is ready!` : `Generating image set for "${productName}"`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className={cn(
                "font-medium",
                isCompleted ? "text-green-800" : "text-blue-800"
              )}>
                {currentStageInfo?.label}
              </span>
              <Badge className={cn(
                isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              )}>
                {Math.round(displayProgress)}%
              </Badge>
            </div>
            
            <Progress 
              value={displayProgress} 
              className={cn(
                "h-3 transition-all duration-300",
                isCompleted && "bg-green-100"
              )}
            />
            
            <p className={cn(
              "text-sm transition-colors",
              isCompleted ? "text-green-600" : "text-blue-600"
            )}>
              {currentStageInfo?.description}
            </p>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-center space-x-2">
            {progressStages.slice(0, -1).map((stage, index) => {
              const isPassed = displayProgress >= stage.threshold;
              const isCurrent = index === currentStage;
              return (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    isPassed ? (isCompleted ? "bg-green-500" : "bg-blue-500") : "bg-gray-300",
                    isCurrent && "ring-2 ring-offset-2",
                    isCurrent && (isCompleted ? "ring-green-300" : "ring-blue-300")
                  )}
                />
              );
            })}
          </div>

          {/* Time Estimate */}
          {!isCompleted && (
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Estimated time: {displayProgress < 50 ? "45-60" : displayProgress < 80 ? "20-30" : "5-10"} seconds
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Please do not close this page. The process will complete automatically.
              </p>
            </div>
          )}

          {/* Success Message */}
          {isCompleted && (
            <div className="p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Images generated successfully!</span>
              </div>
              <p className="text-sm text-green-700">
                12 professional images have been generated and are ready for download.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}