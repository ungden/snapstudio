"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wand2, Sparkles, Loader2, Zap, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { EdgeFunctionClient } from "@/lib/edge-function-client";

interface Profile {
  id: string;
  points_balance: number;
  full_name: string | null;
  email: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  subscription_starts_at: string | null;
  images_generated: number;
  images_limit: number;
  created_at: string;
  updated_at: string;
}

interface CustomGenerationFormProps {
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  profile: Profile | null;
}

const SOLO_COST = 30; // 30 points per solo generation

const promptSuggestions = [
  "A beautiful product on a wooden table with natural lighting",
  "Product arranged in a modern, minimalist space",
  "Close-up product detail with blurred background",
  "Product in a lifestyle context with real users",
  "Top-down angle (flat lay) with decorative props",
  "Product with dramatic, professional lighting effects"
];

export function CustomGenerationForm({ onImageGenerated, profile }: CustomGenerationFormProps) {
  const { user, refreshProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = (profile?.points_balance ?? 0) >= SOLO_COST;
  const hasSubscription = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("You need to log in to generate images");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a description of the image you want to create");
      return;
    }

    if (!selectedImage) {
      toast.error("Please select a product image");
      return;
    }

    if (!canGenerate) {
      toast.error(`Not enough points. ${SOLO_COST} points needed to generate an image.`);
      return;
    }

    setIsGenerating(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });

      const base64Data = await base64Promise;

      // Call edge function for solo generation using the new client
      const { data, error } = await EdgeFunctionClient.invokeGeneration('generate-solo-image', SOLO_COST, {
        prompt: prompt.trim(),
        images: [{
          data: base64Data,
          mimeType: selectedImage.type
        }],
        mode: 'solo',
        isPublic: true
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unable to generate image');
      }

      // Refresh profile to update points balance
      await refreshProfile();

      // Call the callback with generated image
      onImageGenerated(data.imageUrl, prompt.trim());
      
      toast.success("🎉 Image generated successfully!");
      setPrompt(""); // Clear form
      clearImage(); // Clear image

    } catch (error: any) {
      console.error('Error in handleGenerate:', error);
      toast.error(error.message || 'Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Custom Image Generation</h3>
            <p className="text-sm text-gray-600">Describe in detail the image you want to create</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Balance Warning */}
        {!canGenerate && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Not enough points</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              You need {SOLO_COST} points to generate an image. You currently have {profile?.points_balance ?? 0} points.
            </p>
          </div>
        )}

        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Current balance</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-sm",
              canGenerate ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {(profile?.points_balance ?? 0).toLocaleString()} pts
            </Badge>
            {hasSubscription && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                {profile?.subscription_plan} Plan
              </Badge>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Product Image *</Label>
          {!selectedImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="solo-image-upload"
              />
              <label htmlFor="solo-image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Select product image</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP - Max 10MB</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview || ''} 
                alt="Preview" 
                className="w-full max-w-xs mx-auto rounded-lg border"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={clearImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <Label htmlFor="custom-prompt" className="text-sm font-medium">
            Describe the image you want to create *
          </Label>
          <Textarea
            id="custom-prompt"
            placeholder="Example: A black iPhone placed on a wooden table with natural window light, blurred background, professional product photography style..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={isGenerating}
          />
          <div className="text-xs text-gray-500">
            The more detailed the description, the more accurate the image. Include: product, setting, lighting, camera angle.
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Popular prompt suggestions</Label>
          <div className="grid grid-cols-1 gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => insertSuggestion(suggestion)}
                className="text-left justify-start h-auto p-3 text-xs"
                disabled={isGenerating}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Generation Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || !selectedImage || !canGenerate || isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating image...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Generate Now ({SOLO_COST} pts)
            </>
          )}
        </Button>

        {/* Info Footer */}
        <div className="p-3 bg-white rounded-lg border border-purple-200">
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Note:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Each generation costs {SOLO_COST} points</li>
              <li>Generation time: 10-30 seconds</li>
              <li>Generated images will have a SnapStudio watermark</li>
              <li>You can download and use them immediately</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}