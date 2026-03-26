"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2,
  Download,
  Heart,
  Eye,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';
import SafeImage from '@/components/safe-image';

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  name: string;
  product_name: string;
  status: string;
  industry: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface GeneratedImage {
  id: string;
  image_type: string;
  style_name: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  prompt_used: string;
  is_favorite: boolean;
  download_count: number;
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editProductName, setEditProductName] = useState('');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const loadProjectData = async () => {
    if (!user || !projectId) return;
    
    try {
      setLoading(true);
      
      // Load project info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) {
        toast.error('Project not found');
        router.push('/dashboard/projects');
        return;
      }

      setProject(projectData);
      setEditName(projectData.name);
      setEditProductName(projectData.product_name);

      // Load project images
      const { data: imagesData, error: imagesError } = await supabase
        .from('generated_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error loading project');
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    if (!project || !editName.trim() || !editProductName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editName.trim(),
          product_name: editProductName.trim()
        })
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? {
        ...prev,
        name: editName.trim(),
        product_name: editProductName.trim()
      } : null);
      
      setIsEditing(false);
      toast.success('Project updated');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error updating project');
    }
  };

  const toggleFavorite = async (image: GeneratedImage) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ is_favorite: !image.is_favorite })
        .eq('id', image.id);

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { ...img, is_favorite: !img.is_favorite }
          : img
      ));

      toast.success(image.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Error updating favorite');
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

  useEffect(() => {
    if (projectId && user) {
      loadProjectData();
    }
  }, [projectId, user]);

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'display': return 'bg-blue-100 text-blue-800';
      case 'model': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-orange-100 text-orange-800';
      case 'seeding': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Project not found</p>
          <Button onClick={() => router.push('/dashboard/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.product_name}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Project Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product">Product Name</Label>
                  <Input
                    id="edit-product"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                  />
                </div>
                <Button onClick={saveProject}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Basic Info</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Project Name:</strong> {project.name}</div>
                    <div><strong>Product:</strong> {project.product_name}</div>
                    <div><strong>Industry:</strong> {project.industry}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <div className="space-y-2">
                    <div>{getStatusBadge(project.status)}</div>
                    <div className="text-sm text-gray-600">
                      {project.is_public ? 'Public' : 'Private'}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Images:</strong> {images.length}</div>
                    <div><strong>Created:</strong> {new Date(project.created_at).toLocaleString('en-US')}</div>
                    <div><strong>Updated:</strong> {new Date(project.updated_at).toLocaleString('en-US')}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Images ({images.length})</span>
              {images.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard?projectId=${project.id}`)}
                >
                  Continue Generating
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No images yet</h3>
                <p className="text-gray-600 mb-6">Start generating images for this project</p>
                <Button onClick={() => router.push(`/dashboard?projectId=${project.id}`)}>
                  Generate Images
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div 
                      className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-300 transition-all"
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
                      
                      {/* Favorite Badge */}
                      {image.is_favorite && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <Heart className="w-3 h-3 text-white fill-current" />
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="mt-2">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{image.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{image.download_count} downloads</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-1 h-6 w-6"
                            onClick={() => downloadImage(image.image_url, `${image.title}.png`)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`p-1 h-6 w-6 ${image.is_favorite ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                            onClick={() => toggleFavorite(image)}
                          >
                            <Heart className={`w-3 h-3 ${image.is_favorite ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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