"use client";

import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

interface GenerationButtonProps {
  onGenerate: () => void;
  disabled: boolean;
  isProcessing: boolean;
  totalImages: number;
}

export function GenerationButton({ onGenerate, disabled, isProcessing, totalImages }: GenerationButtonProps) {
  return (
    <Button
      onClick={onGenerate}
      size="lg"
      disabled={disabled || isProcessing}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
    >
      <Zap className="w-5 h-5 mr-2" />
      {isProcessing 
        ? 'Generating images...'
        : `Generate ${totalImages} professional images (120 pts)`
      }
      {!isProcessing && <ArrowRight className="w-5 h-5 ml-2" />}
    </Button>
  );
}