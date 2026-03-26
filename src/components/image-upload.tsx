"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IndustrySelector, type IndustryId } from "./industry-selector";
import SafeImage from "@/components/safe-image";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onProductNameChange: (name: string) => void;
  productName: string;
  selectedImage: string | null;
  onClear: () => void;
  customKeywords: string;
  onCustomKeywordsChange: (keywords: string) => void;
  industry: IndustryId;
  onIndustryChange: (industry: IndustryId) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ImageUpload({
  onImageSelect,
  onProductNameChange,
  productName,
  selectedImage,
  onClear,
  customKeywords,
  onCustomKeywordsChange,
  industry,
  onIndustryChange
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP files are supported";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum 10MB";
    }
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);
    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      // Auto-generate product name from filename if empty
      if (!productName.trim()) {
        const nameFromFile = file.name
          .replace(/\.[^/.]+$/, "") // Remove extension
          .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
        onProductNameChange(nameFromFile);
      }

      onImageSelect(file, preview);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error("Error processing image");
    } finally {
      setUploading(false);
    }
  }, [onImageSelect, onProductNameChange, productName]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const handleClear = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    onClear();
    toast.success("Image removed");
  };

  return (
    <div className="space-y-6">
      {/* Industry Selector */}
      <IndustrySelector 
        selectedIndustry={industry} 
        onIndustryChange={onIndustryChange} 
      />

      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-6">
          {!selectedImage ? (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                uploading && "opacity-50 pointer-events-none"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {uploading ? "Processing image..." : "Upload Product Image"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop an image here or click to select a file
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline">JPG</Badge>
                    <Badge variant="outline">PNG</Badge>
                    <Badge variant="outline">WebP</Badge>
                    <Badge variant="outline">Max 10MB</Badge>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  disabled={uploading}
                  className="pointer-events-none"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Select from device
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <div className="aspect-square max-w-sm mx-auto relative overflow-hidden rounded-lg border-2 border-green-200">
                  <SafeImage
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleClear}
                      className="p-2 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-800 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Image is ready!</span>
                </div>
                <p className="text-sm text-green-700">
                  Fill in the details below to start generating your marketing photo set
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card className={cn(
        "border-2 transition-colors",
        selectedImage ? "border-blue-200 bg-blue-50" : "border-gray-200"
      )}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Product Information</h3>
          </div>

          <div>
            <Label htmlFor="product-name" className="text-sm font-medium mb-2 block">
              Product Name *
            </Label>
            <Input
              id="product-name"
              placeholder="e.g. iPhone 15 Pro Max"
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be used for AI prompts and file naming
            </p>
          </div>

          <div>
            <Label htmlFor="custom-keywords" className="text-sm font-medium mb-2 block">
              Additional Keywords (optional)
            </Label>
            <Textarea
              id="custom-keywords"
              placeholder="e.g. premium, elegant, modern, black, metallic..."
              value={customKeywords}
              onChange={(e) => onCustomKeywordsChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add keywords describing features, colors, and materials for more accurate AI-generated images
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 bg-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Tips for the best results:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Use a clear, well-lit product photo</li>
                  <li>Simple background with minimal distractions</li>
                  <li>Product should be proportionally framed</li>
                  <li>Accurate product name helps AI understand better</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}