"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OnboardingGuide } from "@/components/onboarding-guide";
import { GenerationModeSelector } from "@/components/generation-mode-selector";
import { ImageUpload } from "@/components/image-upload";
import { BatchConfigurator } from "@/components/dashboard/batch-configurator";
import { PrivacyToggle } from "@/components/dashboard/privacy-toggle";
import { GenerationButton } from "@/components/dashboard/generation-button";
import { GenerationProgress } from "@/components/generation-progress";
import { GeneratedImagesGrid } from "@/components/generated-images-grid";
import { CustomGenerationForm } from "@/components/custom-generation-form";
import { SoloResultDisplay } from "@/components/solo-result-display";
import { CompactSampleGrid } from "@/components/compact-sample-grid";
import { DashboardStats } from "@/components/dashboard-stats";
import { RecentProjects } from "@/components/recent-projects";
import { PaymentStatusTracker } from "@/components/payment-status-tracker";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useProjectManagement } from "@/hooks/use-project-management";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { useBatchConfig } from "@/hooks/use-batch-config";
import { ImageGenerator } from "@/lib/image-generator";
import { toast } from "sonner";
import type { IndustryId } from "@/components/industry-selector";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [mode, setMode] = useState<'batch' | 'solo'>('batch');
  const [isPublic, setIsPublic] = useState(true);

  // Custom hooks
  const {
    selectedImageFile,
    selectedImagePreview,
    customKeywords,
    setCustomKeywords,
    handleImageSelect,
    handleClearImage
  } = useImageUpload();

  const {
    projectId,
    productName,
    selectedIndustry,
    setProductName,
    setSelectedIndustry,
    createProject,
    clearProject,
    handleProjectCreated
  } = useProjectManagement(user);

  const {
    isProcessing,
    generatedImages,
    progress,
    soloResult,
    subscribeToProject,
    loadExistingImages,
    generateBatchImages,
    handleSoloImageGenerated,
    handleToggleFavorite,
    resetGeneration
  } = useImageGeneration(user, profile, refreshProfile);

  const {
    batchConfig,
    configExampleImages,
    totalSelectedInBatch,
    handleBatchConfigChange
  } = useBatchConfig(selectedIndustry);

  // Subscribe to project updates
  useEffect(() => {
    if (projectId && user) {
      const unsubscribe = subscribeToProject(projectId);
      loadExistingImages(projectId);
      return unsubscribe;
    }
  }, [projectId, user, subscribeToProject, loadExistingImages]);

  const canGenerate = selectedImageFile && productName.trim() && totalSelectedInBatch === 12 && (profile?.points_balance ?? 0) >= 120;

  const handleGenerate = async () => {
    if (!canGenerate || !selectedImageFile) return;

    try {
      let currentProjectId = projectId;
      
      if (!currentProjectId) {
        const projectName = `${productName} - ${new Date().toLocaleDateString('en-US')}`;
        currentProjectId = await createProject(projectName, productName, selectedIndustry, isPublic);
      }

      if (!currentProjectId) {
        throw new Error('Unable to create project');
      }

      await generateBatchImages({
        productName,
        selectedImageFile,
        selectedIndustry,
        projectId: currentProjectId,
        customKeywords,
        isPublic,
        batchConfig
      });
    } catch (error: any) {
      console.error('Error in handleGenerate:', error);
      toast.error(error.message || 'Error generating images');
    }
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      await ImageGenerator.downloadImage(imageUrl, filename);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Error downloading image");
    }
  };

  const handleDownloadAll = async () => {
    try {
      await ImageGenerator.downloadAllImages(generatedImages, productName);
      toast.success("All images downloaded successfully!");
    } catch (error) {
      toast.error("Error downloading images");
    }
  };

  const handleReset = () => {
    resetGeneration('batch', clearProject);
    handleClearImage(true, setProductName);
  };

  const handleNewProject = () => {
    clearProject();
    handleClearImage(true, setProductName);
    resetGeneration('batch', clearProject);
  };

  if (authLoading || !user || !profile) {
    return null; // Let the layout handle loading
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DashboardHeader
        userName={profile.full_name || profile.email?.split('@')[0] || 'You'}
        projectId={projectId}
        pointsBalance={profile.points_balance}
        onNewProject={handleNewProject}
      />

      <PaymentStatusTracker onPaymentSuccess={refreshProfile} />

      {!projectId && generatedImages.length === 0 && !soloResult && (
        <div className="space-y-6">
          <OnboardingGuide />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Statistics</h3>
              <DashboardStats />
            </div>
            <div>
              <RecentProjects />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sample images generated by SnapStudio</h3>
            <CompactSampleGrid />
          </div>
        </div>
      )}

      <div className="space-y-6">
        <GenerationModeSelector mode={mode} onModeChange={setMode} />

        {mode === 'batch' ? (
          <>
            {!isProcessing && generatedImages.length === 0 && (
              <>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onProductNameChange={setProductName}
                  productName={productName}
                  selectedImage={selectedImagePreview}
                  onClear={() => handleClearImage(false)}
                  customKeywords={customKeywords}
                  onCustomKeywordsChange={setCustomKeywords}
                  industry={selectedIndustry}
                  onIndustryChange={setSelectedIndustry}
                />

                {selectedImageFile && (
                  <>
                    <BatchConfigurator
                      batchConfig={batchConfig}
                      onConfigChange={handleBatchConfigChange}
                      exampleImages={configExampleImages}
                      totalSelected={totalSelectedInBatch}
                    />

                    <PrivacyToggle isPublic={isPublic} onToggle={setIsPublic} />

                    <GenerationButton
                      onGenerate={handleGenerate}
                      disabled={!canGenerate}
                      isProcessing={isProcessing}
                      totalImages={totalSelectedInBatch}
                    />
                  </>
                )}
              </>
            )}

            {isProcessing && (
              <GenerationProgress productName={productName} progress={progress} />
            )}

            {generatedImages.length > 0 && (
              <GeneratedImagesGrid
                images={generatedImages}
                productName={productName}
                onDownloadImage={handleDownloadImage}
                onDownloadAll={handleDownloadAll}
                onToggleFavorite={handleToggleFavorite}
                onReset={handleReset}
              />
            )}
          </>
        ) : (
          <>
            <CustomGenerationForm
              onImageGenerated={handleSoloImageGenerated}
              profile={profile}
            />

            {soloResult && (
              <SoloResultDisplay
                imageUrl={soloResult.imageUrl}
                prompt={soloResult.prompt}
                onRegenerate={() => resetGeneration('solo', clearProject)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}