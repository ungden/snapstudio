"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { DashboardLoading } from "@/components/dashboard-loading";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!profile || profile.subscription_plan !== "admin") {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    }
  }, [user, profile, loading, router]);

  if (loading || checking) {
    return <DashboardLoading />;
  }

  if (!user || !profile || profile.subscription_plan !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return <>{children}</>;
}
