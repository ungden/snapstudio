"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  userName: string;
  projectId: string | null;
  pointsBalance: number;
  onNewProject: () => void;
}

export function DashboardHeader({ userName, projectId, pointsBalance, onNewProject }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello {userName}! 👋
        </h1>
        <p className="text-gray-600 text-sm">
          {projectId ? "Generate images for the selected project" : "Create professional marketing images with AI"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-500">Balance</div>
          <div className="text-lg font-bold text-blue-600">
            {pointsBalance.toLocaleString()} pts
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/billing')}>
          <CreditCard className="w-4 h-4 mr-2" /> Top Up
        </Button>
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
    </div>
  );
}