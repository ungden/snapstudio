import type { Metadata } from "next";

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path = "",
  image = "/og-image.jpg",
  keywords = [],
  noIndex = false
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} | SnapStudio`;
  const url = `https://snapstudio.app${path}`;
  const fullImage = image.startsWith('http') ? image : `https://snapstudio.app${image}`;
  
  const allKeywords = [
    "SnapStudio",
    "AI image generation",
    "product photography",
    "marketing",
    "AI photography",
    ...keywords
  ];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    
    // Open Graph
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: "SnapStudio",
      title: fullTitle,
      description,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: "summary_large_image",
      site: "@snapstudio_app",
      creator: "@snapstudio_app",
      title: fullTitle,
      description,
      images: [fullImage],
    },
    
    // Canonical URL
    alternates: {
      canonical: url,
    },
    
    // Robots
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
    },
  };
}

// Industry-specific metadata
export const industryMetadata = {
  'f_b': {
    title: "AI Food & Beverage Photography",
    description: "Specialized prompts for F&B - Studio shots, lifestyle dining, social content. Save 99% on food photography costs.",
    keywords: ["food photos", "food photography", "restaurant marketing", "F&B AI", "menu design"],
    image: "/og-food-beverage.jpg"
  },
  'beauty': {
    title: "AI Beauty & Personal Care Photography",
    description: "Specialized prompts for cosmetics - Luxury aesthetic, model application, skincare campaigns. Professional beauty photography.",
    keywords: ["cosmetics photos", "beauty photography", "skincare marketing", "makeup AI", "cosmetics"],
    image: "/og-beauty.jpg"
  },
  'fashion': {
    title: "AI Fashion & Accessories Photography",
    description: "Specialized prompts for fashion - Editorial style, streetwear vibe, product flat-lay. Fashion photography AI.",
    keywords: ["fashion photos", "fashion photography", "streetwear", "clothing AI", "accessories"],
    image: "/og-fashion.jpg"
  },
  'mother_baby': {
    title: "AI Mother & Baby Photography",
    description: "Specialized prompts for baby products - Safe, warm, family-friendly. Baby product photography AI.",
    keywords: ["baby product photos", "mother baby photography", "family products", "baby AI", "parenting"],
    image: "/og-mother-baby.jpg"
  }
};