"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Folder, 
  Plus, 
  Search, 
  Calendar,
  Image,
  Trash2,
  Edit,
  Eye,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/safe-image';

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  name: string;
  product_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  industry: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  image_count?: number;
  thumbnail_url?: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('f_b');

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load projects with image count
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Get image counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project: Project) => {
          const { count } = await supabase
            .from('generated_images')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id);

          // Get thumbnail (first image)
          const { data: firstImage } = await supabase
            .from('generated_images')
            .select('image_url')
            .eq('project_id', project.id)
            .limit(1)
            .single();

          return {
            ...project,
            image_count: count || 0,
            thumbnail_url: firstImage?.image_url || null
          };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim() || !newProductName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          name: newProjectName.trim(),
          product_name: newProductName.trim(),
          industry: selectedIndustry,
          status: 'pending',
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created successfully!');
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProductName('');
      loadProjects();
      
      // Navigate to dashboard with new project
      router.push(`/dashboard?projectId=${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All images in the project will also be deleted.')) {
      return;
    }

    try {
      // Delete all images in project first
      const { error: imagesError } = await supabase
        .from('generated_images')
        .delete()
        .eq('project_id', projectId);

      if (imagesError) throw imagesError;

      // Delete project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) throw projectError;

      toast.success('Project deleted');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
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

  const getIndustryBadge = (industry: string) => {
    const industryMap: Record<string, { label: string; color: string }> = {
      'f_b': { label: '🍔 F&B', color: 'bg-orange-100 text-orange-800' },
      'beauty': { label: '💄 Beauty', color: 'bg-pink-100 text-pink-800' },
      'fashion': { label: '👕 Fashion', color: 'bg-purple-100 text-purple-800' },
      'mother_baby': { label: '👶 Mom&Baby', color: 'bg-blue-100 text-blue-800' },
      'other': { label: '📱 Tech', color: 'bg-gray-100 text-gray-800' }
    };
    
    const info = industryMap[industry] || industryMap['other'];
    return <Badge className={info.color}>{info.label}</Badge>;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h1>
            <p className="text-gray-600">Manage and track all your image generation projects.</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try searching with different keywords' : 'Create your first project to start generating images'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  {project.thumbnail_url ? (
                    <SafeImage
                      src={project.thumbnail_url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {getStatusBadge(project.status)}
                    {getIndustryBadge(project.industry)}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{project.product_name}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      <span>{project.image_count || 0} images</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.created_at).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/dashboard?projectId=${project.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Holiday Photo Set 2025"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="e.g. iPhone 15 Pro Max"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f_b">🍔 Food & Beverage</SelectItem>
                  <SelectItem value="beauty">💄 Beauty & Personal Care</SelectItem>
                  <SelectItem value="fashion">👕 Fashion & Accessories</SelectItem>
                  <SelectItem value="mother_baby">👶 Mother & Baby</SelectItem>
                  <SelectItem value="other">📱 Electronics & Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={createProject} className="flex-1">
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}