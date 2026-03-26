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
  Image, 
  Search, 
  RefreshCw,
  Trash2,
  Eye,
  Star,
  EyeOff,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface GeneratedImage {
  id: string;
  image_url: string;
  title: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    email: string | null;
  } | null;
}

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadImages();
  }, [page]);

  const loadImages = async () => {
    try {
      setLoading(true);
      
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('generated_images')
        .select('*, profiles(email)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.textSearch('title', searchTerm.trim(), { type: 'websearch' });
      }

      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error loading images:', error);
        toast.error('Error loading images: ' + error.message);
        return;
      }

      setImages((data as GeneratedImage[]) || []);
      setTotalCount(count || 0);

    } catch (error) {
      console.error('Error in loadImages:', error);
      toast.error('Error loading image list');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // In a real app, you'd also delete from storage
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  const toggleFeature = async (image: GeneratedImage) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ is_featured: !image.is_featured })
        .eq('id', image.id);

      if (error) throw error;

      setImages(prev => prev.map(img => img.id === image.id ? { ...img, is_featured: !image.is_featured } : img));
      toast.success(image.is_featured ? 'Removed from featured' : 'Marked as featured');
    } catch (error) {
      toast.error('Error updating');
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Management</h1>
              <p className="text-gray-600">View and manage all user-generated images.</p>
            </div>
            <Button onClick={loadImages} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by image name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadImages()}
                className="flex-1"
              />
              <Button onClick={loadImages}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading images...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative">
                  <img 
                    src={image.image_url} 
                    alt={image.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" onClick={() => setSelectedImage(image)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{image.title}</p>
                  <p className="text-xs text-gray-500 truncate">{image.profiles?.email || 'N/A'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={image.is_public ? 'default' : 'secondary'}>
                      {image.is_public ? 'Public' : 'Private'}
                    </Badge>
                    {image.is_featured && <Badge variant="destructive">Featured</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setPage(p => Math.max(0, p - 1)); }}
                    className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>
                    Page {page + 1} / {totalPages}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages - 1, p + 1)); }}
                    className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedImage.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img src={selectedImage.image_url} alt={selectedImage.title} className="rounded-lg w-full" />
                <div className="space-y-4">
                  <h3 className="font-semibold">Details</h3>
                  <div className="text-sm space-y-2">
                    <p><User className="inline w-4 h-4 mr-2" /><strong>Creator:</strong> {selectedImage.profiles?.email || 'N/A'}</p>
                    <p><Calendar className="inline w-4 h-4 mr-2" /><strong>Created:</strong> {new Date(selectedImage.created_at).toLocaleString()}</p>
                    <p><TrendingUp className="inline w-4 h-4 mr-2" /><strong>Visibility:</strong> {selectedImage.is_public ? 'Public' : 'Private'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => toggleFeature(selectedImage)}>
                      {selectedImage.is_featured ? <EyeOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                      {selectedImage.is_featured ? 'Remove Featured' : 'Mark Featured'}
                    </Button>
                    <Button variant="destructive" onClick={() => { deleteImage(selectedImage.id); setSelectedImage(null); }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Image
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}