"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageSquare, Search, Loader2, Users, TrendingUp, Star } from "lucide-react";
import { CommunityImageDialog } from "@/components/community-image-dialog";
import { FollowingFeed } from "@/components/following-feed";
import SafeImage from "@/components/safe-image";

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface CommunityImage {
  id: string;
  title: string;
  image_url: string;
  watermarked_image_url: string | null;
  thumbnail_url: string | null;
  user_id: string;
  full_name: string | null;
  email: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<CommunityImage | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [activeTab, setActiveTab] = useState<'explore' | 'following'>('explore');

  const PAGE_SIZE = 20;

  const loadImages = useCallback(async (reset = false) => {
    if (loading && !reset) return;
    setLoading(true);

    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      let query = supabase
        .from('community_feed')
        .select('*')
        .range(from, to);

      if (sort === 'popular') {
        query = query.order('like_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading images:", error);
        toast.error("Failed to load community images");
        return;
      }

      if (data) {
        const transformedData = data.map((item: any) => ({
          ...item,
          profiles: {
            full_name: item.full_name,
            email: item.email
          }
        }));
        
        setImages(prev => reset ? transformedData : [...prev, ...transformedData]);
        setHasMore(data.length === PAGE_SIZE);
        if (!reset) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error in loadImages:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, sort]);

  useEffect(() => {
    loadImages(true);
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  useEffect(() => {
    if (!user) return;

    const fetchLikedImages = async () => {
      try {
        const { data, error } = await supabase
          .from("community_likes")
          .select("image_id")
          .eq("user_id", user.id);
        setLikedIds(new Set((data || []).map((r: { image_id: string }) => r.image_id)));
      } catch (error) {
        console.error("Error fetching liked images:", error);
      }
    };

    fetchLikedImages();
  }, [user]);

  const handleLike = async (image: CommunityImage) => {
    if (!user) {
      toast.error("You need to sign in to like images");
      return;
    }

    const isLiked = likedIds.has(image.id);
    const originalLikedIds = new Set(likedIds);
    const originalImages = [...images];

    // Optimistic update
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

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("community_likes")
          .delete()
          .match({ user_id: user.id, image_id: image.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_likes")
          .insert({ user_id: user.id, image_id: image.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error liking image:", error);
      toast.error("Failed to like image");
      // Revert optimistic update
      setLikedIds(originalLikedIds);
      setImages(originalImages);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">SnapStudio Community</h1>
          <p className="text-lg text-gray-600">Discover creative works from the user community.</p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-lg shadow-sm flex gap-2">
            <Button 
              variant={activeTab === 'explore' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Explore
            </Button>
            <Button 
              variant={activeTab === 'following' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('following')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Following
            </Button>
          </div>
        </div>

        {activeTab === 'explore' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search images..." className="pl-10" />
              </div>
              <Select value={sort} onValueChange={(value: 'latest' | 'popular') => setSort(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((image) => (
                <Card 
                  key={image.id} 
                  className="overflow-hidden break-inside-avoid cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative">
                    <SafeImage
                      src={image.thumbnail_url || image.watermarked_image_url || image.image_url}
                      alt={image.title}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 p-3 text-white">
                        <p className="font-semibold text-sm truncate">{image.title}</p>
                        <p className="text-xs opacity-80">
                          by {image.full_name || image.email?.split('@')[0] || 'User'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3 flex justify-between items-center">
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
                      onClick={(e) => { e.stopPropagation(); handleLike(image); }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            )}

            {hasMore && !loading && (
              <div className="text-center mt-8">
                <Button onClick={() => loadImages()}>Load More</Button>
              </div>
            )}
          </>
        ) : (
          <FollowingFeed />
        )}
      </div>

      <CommunityImageDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        image={selectedImage ? {
          ...selectedImage,
          profiles: {
            full_name: selectedImage.full_name,
            email: selectedImage.email
          }
        } : null}
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