import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { isDemoMode } from '@/lib/demo-mode';
import { toast } from 'sonner';

const supabase = createSupabaseBrowserClient();

export interface GeneratedImage {
  id: string;
  project_id: string;
  user_id: string;
  image_type: 'display' | 'model' | 'social' | 'seeding';
  style_name: string;
  title: string;
  description: string | null;
  image_url: string;
  watermarked_image_url?: string | null;
  prompt_used: string;
  is_favorite: boolean;
  is_public: boolean;
  download_count: number;
  created_at: string;
}

export class ImageGenerator {
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  static async downloadImage(imageUrl: string, filename: string): Promise<void> {
    if (isDemoMode()) {
      toast.info('Demo mode: image download is not available');
      return;
    }

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
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  static async downloadAllImages(images: GeneratedImage[], productName: string): Promise<void> {
    if (isDemoMode()) {
      toast.info('Demo mode: image download is not available');
      return;
    }

    try {
      for (const image of images) {
        const filename = `${productName}_${image.image_type}_${image.style_name}.png`;
        await this.downloadImage(image.image_url, filename);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Batch download failed:', error);
      throw error;
    }
  }

  static async toggleFavorite(imageId: string, currentFavorite: boolean): Promise<void> {
    if (isDemoMode()) return;

    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ is_favorite: !currentFavorite })
        .eq('id', imageId);

      if (error) {
        console.error('Error toggling favorite:', error);
        throw new Error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      throw error;
    }
  }

  static async incrementDownloadCount(imageId: string): Promise<void> {
    if (isDemoMode()) return;

    try {
      const { error } = await supabase.rpc('increment_download_count', {
        image_id: imageId
      });

      if (error) {
        console.error('Error incrementing download count:', error);
        // Don't throw error as this is not critical
      }
    } catch (error) {
      console.error('Error in incrementDownloadCount:', error);
      // Don't throw error as this is not critical
    }
  }
}
