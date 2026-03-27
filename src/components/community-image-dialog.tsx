"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageSquare, Download, Share2, Send, Loader2, User, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import SafeImage from "@/components/safe-image";
import { ImageGenerator } from "@/lib/image-generator";

const supabase = createSupabaseBrowserClient();

interface CommunityImage {
  id: string;
  title: string;
  image_url: string;
  watermarked_image_url?: string | null;
  thumbnail_url?: string | null;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  like_count: number;
  comment_count: number;
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

interface CommunityImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: CommunityImage | null;
  isLiked?: boolean;
  onLike?: () => void;
  onCommentAdded?: () => void;
}

export function CommunityImageDialog({
  open,
  onOpenChange,
  image,
  isLiked,
  onLike,
  onCommentAdded,
}: CommunityImageDialogProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && image) {
      const loadComments = async () => {
        const { data, error } = await supabase
          .from('community_comments')
          .select('*, profiles(full_name, email)')
          .eq('image_id', image.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setComments(data as Comment[]);
        }
      };
      loadComments();
    } else {
      setComments([]);
      setCommentText("");
    }
  }, [open, image]);

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
      setCommentText("");
      onCommentAdded?.();
    } catch (error) {
      toast.error("Error posting comment");
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
      toast.error("Image download failed.");
    }
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 bg-black flex items-center justify-center">
            <SafeImage
              src={image.watermarked_image_url || image.image_url}
              alt={image.title}
              className="max-h-[80vh] w-auto h-auto object-contain"
            />
          </div>
          <div className="md:col-span-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{image.profiles?.full_name || image.profiles?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">Author</p>
                  </div>
                </div>
                <Link href={`/community/${image.id}`}>
                  <Button variant="ghost" size="sm">
                    Details <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> {image.like_count}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {comments.length}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="w-8 h-8"><Share2 className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleDownload}><Download className="w-4 h-4" /></Button>
                <Button size="icon" className="w-8 h-8" onClick={onLike} variant={isLiked ? "default" : "outline"}>
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-80">
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
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <div className="p-4 border-t bg-gray-50">
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
      </DialogContent>
    </Dialog>
  );
}