"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Heart, MessageSquare, Loader2, User } from 'lucide-react';
import { CommunityImageDialog } from '@/components/community-image-dialog';
import SafeImage from './safe-image';

const supabase = createSupabaseBrowserClient();

interface BaseImage {
  id: string;
  title: string;
  image_url: string;
  user_id: string;
}

interface FeedImage extends BaseImage {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  like_count: number;
  comment_count: number;
}

export function FollowingFeed() {
  const { user } = useAuth();
  const [images, setImages] = useState<FeedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<FeedImage | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  const loadFeed = useCallback(async (reset = false) => {
    if (!user || (loading && !reset)) return;
    setLoading(true);

    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      // Get who the user is following
      const { data: following, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;
      if (!following || following.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const followingIds = (following || []).map((f: { following_id: string }) => f.following_id);

      // Get images from those users
      const { data: images, error: imagesError } = await supabase
        .from('generated_images')
        .select('id, title, image_url, user_id')
        .in('user_id', followingIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (imagesError) throw imagesError;

      if (images && images.length > 0) {
        // Load profiles for image authors
        const userIds = Array.from(new Set((images || []).map((img: BaseImage) => img.user_id)));
        let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        (profiles || []).forEach((p: { id: string; full_name: string | null; email: string | null }) => {
          profilesMap[p.id] = { full_name: p.full_name, email: p.email };
        });

        // Combine images with profiles
        const enrichedImages: FeedImage[] = (images || []).map((img: BaseImage) => ({
          ...img,
          profiles: profilesMap[img.user_id] || null,
          like_count: 0, // Will be loaded next
          comment_count: 0, // Will be loaded next
        }));

        setImages(prev => reset ? enrichedImages : [...prev, ...enrichedImages]);
        setHasMore(images.length === PAGE_SIZE);
        if (!reset) {
          setPage(prev => prev + 1);
        }

        if (images && images.length > 0) {
          await loadImageStats(images.map((img: BaseImage) => img.id));
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
      toast.error("Error loading feed");
    } finally {
      setLoading(false);
    }
  }, [user, loading, page]);

  const loadImageStats = async (imageIds: string[]) => {
    const { data: stats, error } = await supabase.rpc('get_image_stats', { image_ids: imageIds });
    if (error) {
      console.error("Error loading image stats:", error);
      return;
    }
    
    setImages(prev => prev.map(img => {
      const stat = stats.find((s: any) => s.image_id === img.id);
      return stat ? { ...img, like_count: stat.like_count, comment_count: stat.comment_count } : img;
    }));
  };

  useEffect(() => {
    loadFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchLikedImages = async () => {
      const { data } = await supabase
        .from("community_likes")
        .select("image_id")
        .eq("user_id", user.id);
      setLikedIds(new Set((data || []).map((like: { image_id: string }) => like.image_id)));
    };

    fetchLikedImages();
  }, [user]);

  const handleLike = async (image: FeedImage) => {
    if (!user) return;

    const isLiked = likedIds.has(image.id);
    const updatedLikedIds = new Set(likedIds);
    if (isLiked) {
      updatedLikedIds.delete(image.id);
    } else {
      updatedLikedIds.add(image.id);
    }
    setLikedIds(updatedLikedIds);

    setImages(prev => prev.map(img => 
      img.id === image.id 
        ? { ...img, like_count: img.like_count + (isLiked ? -1 : 1) }
        : img
    ));

    if (isLiked) {
      await supabase.from("community_likes").delete().match({ user_id: user.id, image_id: image.id });
    } else {
      await supabase.from("community_likes").insert({ user_id: user.id, image_id: image.id });
    }
  };

  if (loading && page === 0) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;
  }

  if (!user) {
    return <p className="text-center text-gray-600">Please log in to view your feed.</p>;
  }

  if (images.length === 0) {
    return <p className="text-center text-gray-600">You haven't followed anyone yet, or they haven't posted any images.</p>;
  }

  return (
    <>
      <div className="space-y-8 max-w-2xl mx-auto">
        {images.map(image => (
          <Card key={image.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{image.profiles?.full_name || image.profiles?.email?.split('@')[0]}</p>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-100 cursor-pointer" onClick={() => setSelectedImage(image)}>
              <SafeImage src={image.image_url} alt={image.title} className="w-full h-auto" />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {image.like_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> {image.comment_count}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={likedIds.has(image.id) ? "default" : "outline"}
                  onClick={() => handleLike(image)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm"><span className="font-semibold">{image.profiles?.full_name || image.profiles?.email?.split('@')[0]}</span> {image.title}</p>
            </CardContent>
          </Card>
        ))}
        {hasMore && !loading && (
          <div className="text-center">
            <Button onClick={() => loadFeed()}>Load More</Button>
          </div>
        )}
        {loading && page > 0 && (
          <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
        )}
      </div>

      <CommunityImageDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        image={selectedImage}
        isLiked={selectedImage ? likedIds.has(selectedImage.id) : false}
        onLike={selectedImage ? () => handleLike(selectedImage) : undefined}
        onCommentAdded={() => {
          if (selectedImage) {
            setImages(prev => prev.map(img => 
              img.id === selectedImage.id 
                ? { ...img, comment_count: img.comment_count + 1 }
                : img
            ));
          }
        }}
      />
    </>
  );
}