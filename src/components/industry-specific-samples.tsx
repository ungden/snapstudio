"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/safe-image";
import type { IndustryId } from "./industry-selector";

const supabase = createSupabaseBrowserClient();

type ImageType = "display" | "model" | "social" | "seeding";

interface SampleItem {
  id: string;
  type: ImageType;
  title: string;
  imageUrl: string;
}

export function IndustrySpecificSamples({ industry }: { industry: IndustryId }) {
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [preview, setPreview] = useState<SampleItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSamples = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("generated_images")
          .select("id, image_type, title, image_url")
          .eq("is_sample", true)
          .eq("industry", industry)
          .limit(8);

        if (error) {
          console.error("Error loading industry samples:", error);
          return;
        }

        if (data && data.length > 0) {
          const realSamples: SampleItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.image_type as ImageType,
            title: item.title,
            imageUrl: item.image_url || "",
          }));
          setSamples(realSamples);
        } else {
          setSamples([]);
        }
      } catch (error) {
        console.error("Error loading samples:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSamples();
  }, [industry]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sample images available for this industry yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {samples.map((item) => (
          <div
            key={item.id}
            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setPreview(item)}
          >
            <SafeImage
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <p className="absolute bottom-2 left-2 text-white text-xs font-semibold truncate">
              {item.title}
            </p>
          </div>
        ))}
      </div>

      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        imageUrl={preview?.imageUrl || "/placeholder.svg"}
        title={preview?.title}
      />
    </>
  );
}