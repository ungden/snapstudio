"use client";

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Heart, 
  Search, 
  RefreshCw,
  Trash2,
  Eye,
  Flag,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const supabase = createSupabaseBrowserClient();

interface Comment {
  id: string;
  image_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Like {
  id: string;
  image_id: string;
  user_id: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface ImageInfo {
  id: string;
  title: string;
  image_url: string;
}

export default function CommunityPage() {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [images, setImages] = useState<Record<string, ImageInfo>>({});
  const [activeTab, setActiveTab] = useState<'comments' | 'likes'>('comments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (commentsError) throw commentsError;

      // Load likes
      const { data: likesData, error: likesError } = await supabase
        .from('community_likes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (likesError) throw likesError;

      setComments(commentsData || []);
      setLikes(likesData || []);

      // Get unique user IDs and image IDs
      const allData = [...(commentsData || []), ...(likesData || [])];
      const userIds = Array.from(new Set(allData.map(item => item.user_id)));
      const imageIds = Array.from(new Set(allData.map(item => item.image_id)));

      // Load profiles
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const profilesMap: Record<string, Profile> = {};
        (profilesData || []).forEach((profile: Profile) => {
          profilesMap[profile.id] = profile;
        });
        setProfiles(profilesMap);
      }

      // Load image info
      if (imageIds.length > 0) {
        const { data: imagesData } = await supabase
          .from('generated_images')
          .select('id, title, image_url')
          .in('id', imageIds);

        const imagesMap: Record<string, ImageInfo> = {};
        (imagesData || []).forEach((image: ImageInfo) => {
          imagesMap[image.id] = image;
        });
        setImages(imagesMap);
      }

    } catch (error) {
      console.error('Error loading community data:', error);
      toast.error('Error loading community data');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  const deleteLike = async (likeId: string) => {
    if (!confirm('Are you sure you want to remove this like?')) return;

    try {
      const { error } = await supabase
        .from('community_likes')
        .delete()
        .eq('id', likeId);

      if (error) throw error;

      setLikes(prev => prev.filter(l => l.id !== likeId));
      toast.success('Like removed');
    } catch (error) {
      toast.error('Error removing like');
    }
  };

  const filteredComments = comments.filter(comment => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    const profile = profiles[comment.user_id];
    const image = images[comment.image_id];
    
    return (
      comment.content.toLowerCase().includes(search) ||
      profile?.email?.toLowerCase().includes(search) ||
      profile?.full_name?.toLowerCase().includes(search) ||
      image?.title?.toLowerCase().includes(search)
    );
  });

  const filteredLikes = likes.filter(like => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    const profile = profiles[like.user_id];
    const image = images[like.image_id];
    
    return (
      profile?.email?.toLowerCase().includes(search) ||
      profile?.full_name?.toLowerCase().includes(search) ||
      image?.title?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Management</h1>
                  <p className="text-gray-600">Moderate comments and manage community interactions.</p>
                </div>
                <Button onClick={loadCommunityData} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Comments</p>
                      <p className="text-2xl font-bold">{comments.length}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Likes</p>
                      <p className="text-2xl font-bold">{likes.length}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold">{Object.keys(profiles).length}</p>
                    </div>
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === 'comments' ? 'default' : 'outline'}
                onClick={() => setActiveTab('comments')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.length})
              </Button>
              <Button
                variant={activeTab === 'likes' ? 'default' : 'outline'}
                onClick={() => setActiveTab('likes')}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Likes ({likes.length})
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'comments' ? 'Comments List' : 'Likes List'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : activeTab === 'comments' ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredComments.map((comment) => {
                          const profile = profiles[comment.user_id];
                          const image = images[comment.image_id];
                          
                          return (
                            <TableRow key={comment.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{profile?.full_name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{profile?.email || 'N/A'}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {image?.image_url && (
                                    <img 
                                      src={image.image_url} 
                                      alt={image.title}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )}
                                  <div className="text-sm truncate max-w-32">
                                    {image?.title || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="text-sm truncate">{comment.content}</div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(comment.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedComment(comment)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteComment(comment.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLikes.map((like) => {
                          const profile = profiles[like.user_id];
                          const image = images[like.image_id];
                          
                          return (
                            <TableRow key={like.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{profile?.full_name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{profile?.email || 'N/A'}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {image?.image_url && (
                                    <img 
                                      src={image.image_url} 
                                      alt={image.title}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )}
                                  <div className="text-sm truncate max-w-32">
                                    {image?.title || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(like.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteLike(like.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={!!selectedComment} onOpenChange={(open) => !open && setSelectedComment(null)}>
        <DialogContent className="max-w-2xl">
          {selectedComment && (
            <>
              <DialogHeader>
                <DialogTitle>Comment Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Commenter</h4>
                  <div className="text-sm">
                    <div><strong>Name:</strong> {profiles[selectedComment.user_id]?.full_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {profiles[selectedComment.user_id]?.email || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Commented Image</h4>
                  {images[selectedComment.image_id] && (
                    <div className="flex items-center gap-3">
                      <img 
                        src={images[selectedComment.image_id].image_url} 
                        alt={images[selectedComment.image_id].title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{images[selectedComment.image_id].title}</div>
                        <div className="text-sm text-gray-500">ID: {selectedComment.image_id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Comment Content</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedComment.content}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Time</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedComment.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteComment(selectedComment.id);
                      setSelectedComment(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Comment
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}