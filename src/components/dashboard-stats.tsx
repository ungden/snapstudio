"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/integrations/supabase/client";
import { Image, Heart, Folder, Clock, Loader2 } from "lucide-react";

const supabase = createSupabaseBrowserClient();

export function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    images: 0,
    projects: 0,
    favorites: 0,
    days: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get images count
        const { count: imagesCount, error: imagesError } = await supabase
          .from("generated_images")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (imagesError) {
          console.error("Error fetching images count:", imagesError);
        }

        // Get projects count
        const { count: projectsCount, error: projectsError } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (projectsError) {
          console.error("Error fetching projects count:", projectsError);
        }

        // Get favorites count
        const { count: favoritesCount, error: favoritesError } = await supabase
          .from("generated_images")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_favorite", true);

        if (favoritesError) {
          console.error("Error fetching favorites count:", favoritesError);
        }

        const daysSinceSignup = Math.floor(
          (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24)
        );

        setStats({
          images: imagesCount || 0,
          projects: projectsCount || 0,
          favorites: favoritesCount || 0,
          days: Math.max(0, daysSinceSignup),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statItems = [
    { icon: Image, label: "Images Created", value: stats.images, color: "text-blue-600" },
    { icon: Folder, label: "Projects", value: stats.projects, color: "text-green-600" },
    { icon: Heart, label: "Favorites", value: stats.favorites, color: "text-red-600" },
    { icon: Clock, label: "Days Since Joined", value: stats.days, color: "text-purple-600" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 w-8 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-6 w-1/2 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 ${item.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-gray-900">{item.value.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}