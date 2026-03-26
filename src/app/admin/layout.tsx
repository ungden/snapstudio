"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { DashboardLoading } from "@/components/dashboard-loading";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const next = encodeURIComponent(pathname || "/admin");
        router.replace(`/login?next=${next}`);
      } else if (!profile || profile.subscription_plan !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [user, profile, loading, router, pathname]);

  if (loading || !user) {
    return <DashboardLoading />;
  }

  if (!profile || profile.subscription_plan !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">You do not have admin access</div>
          <div className="text-gray-600 mb-4">Please contact admin if you believe this is an error.</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => router.replace("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Return children without sidebar - UnifiedLayout will handle it
  return <>{children}</>;
}
