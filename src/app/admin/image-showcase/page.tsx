"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Palette, 
  Search, 
  RefreshCw,
  Plus,
  Star,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { useFeaturedImages } from '../hooks/useFeaturedImages';

const supabase = createSupabaseBrowserClient();

type ImageType = 'display' | 'model' | 'social' | 'seeding';

interface GeneratedImage {
  id: string;
  image_url: string;
  title: string;
  is_featured: boolean;
  image_type: ImageType;
}

export default function ImageShowcasePage() {
  const { loading: featuredLoading, featuredImages, removeFeature, addFeature, reload } = useFeaturedImages();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeneratedImage[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, image_url, title, is_featured, image_type')
      .textSearch('title', searchQuery.trim(), { type: 'websearch' })
      .limit(20);

    if (error) {
      toast.error('Error searching images');
    } else {
      setSearchResults((data as GeneratedImage[]) || []);
    }
    setSearchLoading(false);
  };

  const handleAddFeature = async (image: GeneratedImage) => {
    await addFeature(image);
    setSearchResults(prev => prev.map(img => img.id === image.id ? { ...img, is_featured: true } : img));
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Showcase Management</h1>
              <p className="text-gray-600">Select featured images to display on the homepage and dashboard.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Featured Image
              </Button>
              <Button onClick={reload} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(featuredImages).map(([category, images]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center justify-between">
                  {category}
                  <Badge>{images.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {featuredLoading ? (
                  <p>Loading...</p>
                ) : images.length === 0 ? (
                  <p className="text-sm text-gray-500">No featured images yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image: GeneratedImage) => (
                      <div key={image.id} className="relative group">
                        <img src={image.image_url} alt={image.title} className="w-full h-32 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="destructive" onClick={() => removeFeature(image)}>
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Image to Showcase</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="Search images by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searchLoading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {searchLoading ? (
            <p>Searching...</p>
          ) : (
            <div className="max-h-96 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults.map(image => (
                <div key={image.id} className="relative group">
                  <img src={image.image_url} alt={image.title} className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.is_featured ? (
                      <Badge variant="secondary">
                        <Check className="w-4 h-4 mr-1" />
                        Added
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleAddFeature(image)}>
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs truncate mt-1">{image.title}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}