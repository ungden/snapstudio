"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageSquare, Download, Share2, Send, Loader2, User, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import SafeImage from "@/components/safe-image";
import { ImageGenerator } from "@/lib/image-generator";

const supabase = createSupabaseBrowserClient();

export const dynamic = "force-dynamic";

interface CommunityImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  watermarked_image_url: string | null;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function ImageDetailPage() {
  const params = useParams();
  const imageId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<CommunityImage | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!imageId) return;

    const loadImage = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('community_feed')
          .select('*')
          .eq('id', imageId)
          .single();

        if (error || !data) {
          toast.error("Image not found");
          router.push('/community');
          return;
        }
        setImage(data as CommunityImage);
        loadComments(data.id);
      } catch (error) {
        console.error("Error loading image:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadComments = async (imageId: string) => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*, profiles(full_name, email)')
        .eq('image_id', imageId)
        .order('created_at', { ascending: false });
      
      if (data) {
        setComments(data as Comment[]);
      }
    };

    loadImage();
  }, [imageId, router]);

  useEffect(() => {
    if (!user || !image) return;

    const checkLike = async () => {
      const { data, error } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('image_id', image.id)
        .maybeSingle();
      
      setIsLiked(!!data);
    };
    checkLike();
  }, [user, image]);

  const handleLike = async () => {
    if (!user || !image) {
      toast.error("You need to sign in to like images");
      return;
    }

    const originalIsLiked = isLiked;
    const originalLikeCount = image.like_count;

    // Optimistic update
    setIsLiked(!originalIsLiked);
    setImage(prev => prev ? { ...prev, like_count: prev.like_count + (originalIsLiked ? -1 : 1) } : null);

    try {
      if (originalIsLiked) {
        await supabase.from('community_likes').delete().match({ user_id: user.id, image_id: image.id });
      } else {
        await supabase.from('community_likes').insert({ user_id: user.id, image_id: image.id });
      }
    } catch (error) {
      toast.error("Failed to like image");
      // Revert
      setIsLiked(originalIsLiked);
      setImage(prev => prev ? { ...prev, like_count: originalLikeCount } : null);
    }
  };

  const handleComment = async () => {
    if (!user || !image || !commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({ user_id: user.id, image_id: image.id, content: commentText.trim() })
        .select('*, profiles(full_name, email)')
        .single();

      if (error) throw error;

      setComments(prev => [data as Comment, ...prev]);
      setImage(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    const urlToDownload = image.watermarked_image_url || image.image_url;
    const filename = `${image.title}-snapstudio.jpg`;
    try {
      await ImageGenerator.downloadImage(urlToDownload, filename);
      toast.success("Image downloaded successfully!");
    } catch {
      toast.error("Failed to download image.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Image not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </Button>
      <Card className="overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-black flex items-center justify-center">
            <SafeImage
              src={image.watermarked_image_url || image.image_url}
              alt={image.title}
              className="max-h-[80vh] w-auto h-auto object-contain"
            />
          </div>
          <div className="lg:col-span-1 flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{image.profiles?.full_name || image.profiles?.email?.split('@')[0]}</p>
                  <p className="text-sm text-gray-500">Posted on {new Date(image.created_at).toLocaleDateString('en-US')}</p>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
              <p className="text-gray-600">{image.description}</p>
            </div>
            <div className="p-6 flex items-center justify-between border-b">
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" /> {image.like_count}
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> {image.comment_count}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Share2 className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4" /></Button>
                <Button size="sm" onClick={handleLike} variant={isLiked ? "default" : "outline"}>
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-80">
              <h3 className="font-semibold">Comments ({comments.length})</h3>
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{comment.profiles?.full_name || comment.profiles?.email?.split('@')[0]}</span>
                      <span className="text-gray-500 ml-2 text-xs">{new Date(comment.created_at).toLocaleDateString('en-US')}</span>
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    disabled={isSubmitting}
                  />
                  <Button onClick={handleComment} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}