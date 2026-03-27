"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Heart, Search, Download, Eye, Loader2, HeartOff } from 'lucide-react';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/safe-image';

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface FavoriteImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  image_type: string;
  style_name: string;
  download_count: number;
  created_at: string;
  project_id: string;
  projects: {
    name: string;
  } | null;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<FavoriteImage | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_images')
        .select('*, projects(name)')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data as FavoriteImage[] || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Error loading favorite images');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ is_favorite: false })
        .eq('id', imageId);

      if (error) throw error;

      setFavorites(prev => prev.filter(img => img.id !== imageId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Error removing from favorites');
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading image');
    }
  };

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'display': return 'bg-blue-100 text-blue-800';
      case 'model': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-orange-100 text-orange-800';
      case 'seeding': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFavorites = favorites.filter(image =>
    !searchTerm || 
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.projects && image.projects.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorite Images</h1>
            <p className="text-gray-600">All images you have marked as favorites.</p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search favorite images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Favorites Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading favorite images...</p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No images found' : 'No favorite images yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try searching with different keywords' : 'Mark images with ❤️ to easily find them later'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/dashboard')}>
                    Generate images now
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFavorites.map((image) => (
                <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div 
                    className="aspect-square relative bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <SafeImage
                      src={image.thumbnail_url || image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-xs ${getTypeBadgeStyles(image.image_type)}`}>
                        {image.image_type}
                      </Badge>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 truncate">{image.title}</h4>
                    <p className="text-xs text-gray-500 mb-3 truncate">
                      {image.projects?.name || 'Unknown project'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{image.download_count} downloads</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-1 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image.image_url, `${image.title}.png`);
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-1 h-6 w-6 text-red-500 border-red-200 bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(image.id);
                          }}
                        >
                          <HeartOff className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(v) => !v && setSelectedImage(null)}
        imageUrl={selectedImage?.image_url || "/placeholder.svg"}
        title={selectedImage?.title}
        onDownload={selectedImage ? () => downloadImage(selectedImage.image_url, `${selectedImage.title}.png`) : undefined}
      />
    </>
  );
}