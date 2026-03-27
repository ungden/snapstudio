import { PageLayout } from '@/components/layout/page-layout';
import SampleOutputsGrid from '@/components/sample-outputs-grid';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: "4 Professional Image Styles",
  description: "Display • Model • Social • Seeding — designed to optimize every marketing channel. See SnapStudio AI template examples.",
  path: "/templates",
  keywords: ["image templates", "photography styles", "marketing templates", "AI templates"]
});

export default function TemplatesPage() {
  return (
    <PageLayout
      title="4 Professional Image Styles"
      subtitle="Display • Model • Social • Seeding — designed to optimize every marketing channel."
    >
      <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Display</h3>
            <p className="text-blue-800">Standard white-background studio photos for websites, catalogs, and e-commerce platforms. Focused on the product with even lighting and no distractions.</p>
          </div>
          
          <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-900 mb-2">Model</h3>
            <p className="text-green-800">Photos with models using the product in real-life settings. Increases credibility and helps customers visualize how to use it.</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h3 className="text-xl font-bold text-orange-900 mb-2">Social</h3>
            <p className="text-orange-800">Images optimized for Facebook, Instagram, TikTok. Eye-catching layouts, vibrant colors, perfect for ads and posts.</p>
          </div>
          
          <div className="p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-purple-900 mb-2">Seeding</h3>
            <p className="text-purple-800">UGC (User Generated Content) photos that look like they were taken by real customers. Increases credibility and perfect for seeding strategies.</p>
          </div>
        </div>
      </div>
      
      <SampleOutputsGrid dense={false} />
    </PageLayout>
  );
}