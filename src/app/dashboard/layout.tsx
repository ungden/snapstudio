"use client";

import { useAuth } from "@/components/auth-provider";
import { DashboardLoading } from "@/components/dashboard-loading";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return <DashboardLoading />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">Unable to load account information</div>
          <div className="text-gray-600 mb-4">Please try reloading the page or contact admin if the error persists.</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Return children without sidebar - UnifiedLayout will handle it
  return <>{children}</>;
}