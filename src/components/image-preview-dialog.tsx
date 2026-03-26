"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import SafeImage from "@/components/safe-image";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  imageUrl: string;
  title?: string;
  onDownload?: () => void;
}

export function ImagePreviewDialog({ open, onOpenChange, imageUrl, title, onDownload }: ImagePreviewDialogProps) {
  const safeUrl = (imageUrl || "").trim().length > 0 ? imageUrl : "/placeholder.svg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="space-y-3">
          {title && <div className="font-semibold">{title}</div>}
          <div className="w-full">
            <SafeImage src={safeUrl} alt={title || "Preview"} className="w-full h-auto rounded-lg" />
          </div>
          {onDownload && (
            <Button onClick={onDownload} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}