"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { 
  Download, 
  Heart, 
  RotateCcw, 
  Sparkles, 
  Eye,
  Globe,
  Lock,
  Share2,
  Copy,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SafeImage from "@/components/safe-image";

export interface GeneratedImage {
  id: string;
  project_id: string;
  user_id: string;
  image_type: 'display' | 'model' | 'social' | 'seeding';
  style_name: string;
  title: string;
  description: string | null;
  image_url: string;
  watermarked_image_url?: string | null;
  thumbnail_url?: string | null;
  prompt_used: string;
  is_favorite: boolean;
  is_public: boolean;
  download_count: number;
  created_at: string;
}

interface GeneratedImagesGridProps {
  images: GeneratedImage[];
  productName: string;
  onDownloadImage: (imageUrl: string, filename: string) => Promise<void>;
  onDownloadAll: () => Promise<void>;
  onToggleFavorite: (imageId: string, currentFavorite: boolean) => Promise<void>;
  onReset: () => void;
}

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case 'display': return 'bg-blue-100 text-blue-800';
    case 'model': return 'bg-green-100 text-green-800';
    case 'social': return 'bg-orange-100 text-orange-800';
    case 'seeding': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeDisplayName = (type: string) => {
  switch (type) {
    case 'display': return 'Display';
    case 'model': return 'Model';
    case 'social': return 'Social';
    case 'seeding': return 'Seeding';
    default: return type;
  }
};

export function GeneratedImagesGrid({
  images,
  productName,
  onDownloadImage,
  onDownloadAll,
  onToggleFavorite,
  onReset
}: GeneratedImagesGridProps) {
  const [preview, setPreview] = useState<GeneratedImage | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = async (image: GeneratedImage) => {
    const filename = `${productName}_${image.image_type}_${image.style_name}.png`;
    await onDownloadImage(image.image_url, filename);
  };

  const handleToggleFavorite = async (image: GeneratedImage) => {
    await onToggleFavorite(image.id, image.is_favorite);
  };

  const copyImageUrl = async (image: GeneratedImage) => {
    try {
      await navigator.clipboard.writeText(image.image_url);
      setCopied(image.id);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Image link copied!");
    } catch (error) {
      toast.error("Unable to copy link");
    }
  };

  const shareImage = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description || `${image.image_type} image for ${productName}`,
          url: image.image_url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await copyImageUrl(image);
    }
  };

  const groupedImages = images.reduce((acc, image) => {
    if (!acc[image.image_type]) {
      acc[image.image_type] = [];
    }
    acc[image.image_type].push(image);
    return acc;
  }, {} as Record<string, GeneratedImage[]>);

  const typeOrder = ['display', 'model', 'social', 'seeding'];
  const sortedTypes = typeOrder.filter(type => groupedImages[type]?.length > 0);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">
                  🎉 Image set is ready!
                </h3>
                <p className="text-green-700 text-sm">
                  {images.length} professional images for "{productName}"
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onDownloadAll}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
              <Button 
                variant="outline" 
                onClick={onReset}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Create New Set
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-8">
              {sortedTypes.map((type) => {
                const typeImages = groupedImages[type] || [];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={cn("text-sm px-3 py-1", getTypeBadgeStyles(type))}>
                        {getTypeDisplayName(type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {typeImages.length} images
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {typeImages.map((image) => (
                        <div key={image.id} className="group relative">
                          {/* Image Container */}
                          <div 
                            className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-300 transition-all"
                            onClick={() => setPreview(image)}
                          >
                            <SafeImage
                              src={image.thumbnail_url || image.watermarked_image_url || image.image_url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex gap-1">
                              <Badge className={cn("text-xs", getTypeBadgeStyles(image.image_type))}>
                                {image.style_name}
                              </Badge>
                            </div>
                            
                            <div className="absolute top-2 right-2 flex gap-1">
                              {image.is_favorite && (
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                  <Heart className="w-3 h-3 text-white fill-current" />
                                </div>
                              )}
                              {image.is_public ? (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <Globe className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                                  <Lock className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button size="sm" variant="secondary" className="p-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Image Info */}
                          <div className="mt-2 space-y-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {image.title}
                            </h4>
                            {image.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {image.description}
                              </p>
                            )}
                            <div className="text-xs text-gray-500">
                              {image.download_count} downloads
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="p-2 h-8 w-8"
                                    onClick={() => handleDownload(image)}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={cn(
                                      "p-2 h-8 w-8",
                                      image.is_favorite && "text-red-500 border-red-200 bg-red-50"
                                    )}
                                    onClick={() => handleToggleFavorite(image)}
                                  >
                                    <Heart className={cn("w-3 h-3", image.is_favorite && "fill-current")} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {image.is_favorite ? "Remove favorite" : "Favorite"}
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="p-2 h-8 w-8"
                                    onClick={() => copyImageUrl(image)}
                                  >
                                    {copied === image.id ? (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy link</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="p-2 h-8 w-8"
                                    onClick={() => shareImage(image)}
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Share</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>

          {/* Summary Stats */}
          <div className="mt-8 p-4 bg-white rounded-lg border border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {sortedTypes.map((type) => {
                const count = groupedImages[type]?.length || 0;
                return (
                  <div key={type}>
                    <div className="text-2xl font-bold text-green-600">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{getTypeDisplayName(type)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        imageUrl={preview?.image_url || "/placeholder.svg"}
        title={preview?.title}
        onDownload={preview ? () => handleDownload(preview) : undefined}
      />
    </>
  );
}