import { PageLayout } from '@/components/layout/page-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, ArrowRight, LogIn, TrendingUp } from 'lucide-react';
import SampleOutputsGrid from '@/components/sample-outputs-grid';
import { cn } from '@/lib/utils';
import { generatePageMetadata, industryMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  ...industryMetadata.fashion,
  path: "/fashion-accessories"
});

export default function FashionAccessoriesPage() {
  const benefits = [
    "Professional flat-lay studio shots with even lighting and sharp textures",
    "Models wearing/accessorizing products in editorial settings",
    "Trendy streetwear and lifestyle content for social media",
    "UGC content like customers sharing their own OOTD photos"
  ];

  const fashionCategories = [
    { name: "Clothing", examples: "Tops, pants, dresses, jackets" },
    { name: "Footwear", examples: "Sneakers, boots, sandals" },
    { name: "Accessories", examples: "Handbags, watches, jewelry" },
    { name: "Streetwear", examples: "Urban style, casual wear" }
  ];

  const fashionStyles = [
    { 
      style: "Editorial Fashion", 
      description: "Models in studio with professional lighting", 
      useCase: "Website, catalog, lookbook" 
    },
    { 
      style: "Streetwear Lifestyle", 
      description: "Street scenes with dynamic, energetic style", 
      useCase: "Social media, youth marketing" 
    },
    { 
      style: "Product Flat-lay", 
      description: "Beautifully arranged products with sharp textures", 
      useCase: "E-commerce, product catalog" 
    },
    { 
      style: "OOTD Content", 
      description: "Outfit of the day, natural UGC style", 
      useCase: "Seeding, influencer marketing" 
    }
  ];

  return (
    <PageLayout
      title="AI-Powered Fashion & Accessories Images"
      subtitle="Specialized prompts for fashion — Editorial style, streetwear vibe, product flat-lay"
    >
      <div className="space-y-16">
        {/* Hero Benefits */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Specialized for Fashion & Accessories
            </h2>
            <p className="text-xl text-gray-600">
              Prompts optimized for editorial style, streetwear aesthetic, and product styling
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fashion Categories */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Perfect for Every Fashion Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fashionCategories.map((category, index) => (
              <Card key={index} className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm">{category.examples}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Fashion Styles */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            4 Fashion Photography Styles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fashionStyles.map((style, index) => (
              <Card key={index} className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{style.style}</h3>
                  <p className="text-gray-600 mb-4">{style.description}</p>
                  <Badge className="bg-purple-100 text-purple-700">
                    {style.useCase}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sample Outputs */}
        <div>
          <SampleOutputsGrid
            title="Sample Fashion Images Generated by SnapStudio"
            subtitle="Editorial shots • Streetwear style • Product flat-lay • OOTD content"
          />
        </div>

        {/* ROI Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ROI for Fashion Brands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                Traditional Studio
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Photographer: $120-$400/session</li>
                <li>• Model: $40-$120/day</li>
                <li>• Studio: $20-$80/day</li>
                <li>• Styling: $40-$80</li>
                <li>• <strong>Total: $200-$680, 3-5 days</strong></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                SnapStudio
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Upload: 5 seconds</li>
                <li>• AI generation: 30 seconds</li>
                <li>• 12 multi-style images: Instant</li>
                <li>• Cost: 120 credits (~$0.50)</li>
                <li>• <strong className="text-green-600">Total: 35 seconds, ~$0.50</strong></li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <p className="text-xl font-bold text-green-600">
                Save 99.9% on time and 99.9% on cost!
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">
            Ready to revolutionize fashion photography?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Create professional fashion images with AI right now. From editorial to streetwear, from flat-lay to OOTD.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl auth-trigger"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Start Creating Fashion Images
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}