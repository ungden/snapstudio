"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { Building2, Eye, Sparkles, AlertCircle, RefreshCw, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/safe-image";

const supabase = createSupabaseBrowserClient();

type ImageType = "display" | "model" | "social" | "seeding";

interface SampleItem {
  id: string;
  type: ImageType;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
}

function typeBadgeStyles(type: ImageType) {
  switch (type) {
    case "display":
      return "bg-blue-100 text-blue-800";
    case "model":
      return "bg-green-100 text-green-800";
    case "social":
      return "bg-orange-100 text-orange-800";
    case "seeding":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function SampleOutputsGrid({
  title = "V\u00ed d\u1ee5 12 output b\u1ea1n s\u1ebd nh\u1eadn \u0111\u01b0\u1ee3c",
  subtitle = "4 nh\u00f3m \u1ea3nh: Display \u2022 Model \u2022 Social \u2022 Seeding",
  dense = false,
  preloadedImages = null,
}: {
  title?: string;
  subtitle?: string;
  dense?: boolean;
  preloadedImages?: any[] | null;
}) {
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [preview, setPreview] = useState<SampleItem | null>(null);
  const [loading, setLoading] = useState(!preloadedImages);

  useEffect(() => {
    if (preloadedImages) {
      const realSamples: SampleItem[] = preloadedImages.map((item: any) => ({
        id: item.id,
        type: item.image_type as ImageType,
        title: item.title,
        description: item.description || "",
        imageUrl: item.image_url || "",
        thumbnailUrl: item.thumbnail_url,
      }));

      const groupedSamples = {
        display: realSamples.filter((s) => s.type === "display").slice(0, 3),
        model: realSamples.filter((s) => s.type === "model").slice(0, 3),
        social: realSamples.filter((s) => s.type === "social").slice(0, 3),
        seeding: realSamples.filter((s) => s.type === "seeding").slice(0, 3),
      };

      const organizedSamples = [
        ...groupedSamples.display,
        ...groupedSamples.model,
        ...groupedSamples.social,
        ...groupedSamples.seeding,
      ];

      if (organizedSamples.length > 0) {
        setSamples(organizedSamples.slice(0, 12));
      }
      setLoading(false);
    } else {
      const loadRealSamples = async () => {
        try {
          const { data, error } = await supabase
            .from("generated_images")
            .select("id, image_type, title, description, image_url, thumbnail_url")
            .eq("is_featured", true)
            .limit(12);

          if (error) {
            console.error("Error loading sample images:", error);
            return;
          }

          if (data && data.length > 0) {
            const realSamples: SampleItem[] = data.map((item: any) => ({
              id: item.id,
              type: item.image_type as ImageType,
              title: item.title,
              description: item.description || "",
              imageUrl: item.image_url || "",
              thumbnailUrl: item.thumbnail_url,
            }));

            const groupedSamples = {
              display: realSamples.filter((s) => s.type === "display").slice(0, 3),
              model: realSamples.filter((s) => s.type === "model").slice(0, 3),
              social: realSamples.filter((s) => s.type === "social").slice(0, 3),
              seeding: realSamples.filter((s) => s.type === "seeding").slice(0, 3),
            };

            const organizedSamples = [
              ...groupedSamples.display,
              ...groupedSamples.model,
              ...groupedSamples.social,
              ...groupedSamples.seeding,
            ];

            if (organizedSamples.length > 0) {
              setSamples(organizedSamples.slice(0, 12));
            }
          }
        } catch (error) {
          console.error("Error loading samples:", error);
        } finally {
          setLoading(false);
        }
      };

      loadRealSamples();
    }
  }, [preloadedImages]);

  const handleDownload = async (item: SampleItem) => {
    try {
      const res = await fetch(item.imageUrl || "/placeholder.svg");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${item.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (!loading && samples.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={cn(dense ? "py-8" : "py-12")}>
        <div className={cn(dense ? "" : "text-center mb-8")}>
          <h3 className={cn("font-bold text-gray-900", dense ? "text-xl mb-2" : "text-2xl md:text-3xl mb-3")}>
            {title}
          </h3>
          <p className={cn("text-gray-600", dense ? "text-sm" : "text-base")}>{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <CardContent className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={cn(dense ? "py-8" : "py-12")}>
      <div className={cn(dense ? "" : "text-center mb-8")}>
        <h3 className={cn("font-bold text-gray-900", dense ? "text-xl mb-2" : "text-2xl md:text-3xl mb-3")}>
          {title}
        </h3>
        <p className={cn("text-gray-600", dense ? "text-sm" : "text-base")}>{subtitle}</p>
      </div>

      <div className={cn("grid gap-4", dense ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6")}>
        {samples.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-0 shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setPreview(item)}
            title="Nh\u1ea5n \u0111\u1ec3 xem l\u1edbn"
          >
            <div className="aspect-square relative bg-gray-100">
              <SafeImage
                src={item.thumbnailUrl || item.imageUrl}
                alt={item.title}
                className="w-full h-full"
              />
              <Badge className={cn("absolute top-2 left-2 text-xs", typeBadgeStyles(item.type))}>
                {item.type}
              </Badge>
            </div>
            <CardContent className="p-3">
              <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
              <div className="text-xs text-gray-600 truncate">{item.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        imageUrl={preview?.imageUrl || "/placeholder.svg"}
        title={preview?.title}
        onDownload={preview ? () => handleDownload(preview) : undefined}
      />
    </section>
  );
}

export default SampleOutputsGrid;
