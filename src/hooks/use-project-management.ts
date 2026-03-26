"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { IndustryId } from "@/components/industry-selector";
import type { User } from "@supabase/supabase-js";

const supabase = createSupabaseBrowserClient();

export function useProjectManagement(user: User | null) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId>('f_b');

  // Load project from URL
  useEffect(() => {
    const pid = searchParams.get("projectId");
    if (pid && pid !== projectId) {
      setProjectId(pid);
      loadProjectData(pid);
    }
  }, [searchParams, projectId, user]);

  const loadProjectData = async (pid: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("product_name, industry, name")
        .eq("id", pid)
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error('Error loading project:', error);
        toast.error('Failed to load project information');
        return;
      }
      
      if (data) {
        setProductName(data.product_name || '');
        setSelectedIndustry((data.industry as IndustryId) || 'f_b');
        toast.success(`Project selected: ${data.name}`);
      }
    } catch (error) {
      console.error('Error in loadProjectData:', error);
    }
  };

  const createProject = useCallback(async (name: string, productName: string, industry: IndustryId, isPublic: boolean) => {
    if (!user) throw new Error('User not authenticated');

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        product_name: productName.trim(),
        status: 'pending',
        industry,
        is_public: isPublic
      })
      .select()
      .single();

    if (projectError || !newProject) {
      throw new Error('Failed to create project: ' + (projectError?.message || 'Unknown error'));
    }
    
    const newProjectId = newProject.id;
    setProjectId(newProjectId);
    
    // Update URL to include project ID
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('projectId', newProjectId);
    window.history.replaceState({}, '', newUrl.toString());
    
    return newProjectId;
  }, [user]);

  const clearProject = useCallback(() => {
    setProjectId(null);
    setProductName("");
    
    // Clear URL params
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('projectId');
    window.history.replaceState({}, '', newUrl.toString());
  }, []);

  const handleProjectCreated = useCallback((project: { id: string }) => {
    setProjectId(project.id);
    router.push(`/dashboard?projectId=${project.id}`);
  }, [router]);

  return {
    projectId,
    productName,
    selectedIndustry,
    setProductName,
    setSelectedIndustry,
    createProject,
    clearProject,
    handleProjectCreated
  };
}