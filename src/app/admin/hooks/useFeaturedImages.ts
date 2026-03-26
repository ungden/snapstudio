import { useState, useCallback, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const supabase = createSupabaseBrowserClient();

type ImageType = 'display' | 'model' | 'social' | 'seeding';

interface GeneratedImage {
  id: string;
  image_url: string;
  title: string;
  is_featured: boolean;
  image_type: ImageType;
}

interface GroupedFeaturedImages {
  display: GeneratedImage[];
  model: GeneratedImage[];
  social: GeneratedImage[];
  seeding: GeneratedImage[];
}

export function useFeaturedImages() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GroupedFeaturedImages>({ display: [], model: [], social: [], seeding: [] });

  const loadImages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, image_url, title, is_featured, image_type')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading featured images');
      setLoading(false);
      return;
    }

    const grouped: GroupedFeaturedImages = { display: [], model: [], social: [], seeding: [] };
    for (const img of data || []) {
      const imageType = img.image_type as ImageType;
      if (grouped[imageType]) {
        grouped[imageType].push(img as GeneratedImage);
      }
    }
    setImages(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const removeFeature = useCallback(async (imageToRemove: GeneratedImage) => {
    const category = imageToRemove.image_type;
    
    const originalImages = { ...images };
    const newCategoryImages = images[category].filter(img => img.id !== imageToRemove.id);
    setImages(prev => ({ ...prev, [category]: newCategoryImages }));

    const { error } = await supabase
      .from('generated_images')
      .update({ is_featured: false })
      .eq('id', imageToRemove.id);

    if (error) {
      toast.error('Lỗi khi gỡ ảnh. Đang hoàn tác.');
      setImages(originalImages);
    } else {
      toast.success('Đã gỡ ảnh khỏi danh sách nổi bật.');
    }
  }, [images]);

  const addFeature = useCallback(async (imageToAdd: GeneratedImage) => {
    const category = imageToAdd.image_type;

    const originalImages = { ...images };
    const newCategoryImages = [...images[category], imageToAdd];
    setImages(prev => ({ ...prev, [category]: newCategoryImages }));

    const { error } = await supabase
      .from('generated_images')
      .update({ is_featured: true })
      .eq('id', imageToAdd.id);

    if (error) {
      toast.error('Lỗi khi thêm ảnh. Đang hoàn tác.');
      setImages(originalImages);
    } else {
      toast.success('Đã thêm ảnh vào danh sách nổi bật.');
    }
  }, [images]);

  return { loading, featuredImages: images, removeFeature, addFeature, reload: loadImages };
}