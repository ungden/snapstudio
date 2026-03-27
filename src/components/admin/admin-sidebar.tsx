"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Shield, BarChart3, Users, Image, Settings, CreditCard, FileText, Database, Activity, LogOut, Home,
  MessageSquare, TrendingUp, DollarSign, Eye, Palette, ChevronsLeft, ChevronsRight, Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSidebar } from '@/components/sidebar-provider';
import { useIsMobile } from '@/hooks/use-mobile';

const supabase = createSupabaseBrowserClient();

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Orders', href: '/admin/orders', icon: CreditCard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Templates', href: '/admin/templates', icon: FileText },
  { name: 'Image Showcase', href: '/admin/image-showcase', icon: Palette },
  { name: 'Generated Images', href: '/admin/images', icon: Image },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Profitability', href: '/admin/profitability', icon: DollarSign },
  { name: 'Activity', href: '/admin/activity', icon: Activity },
  { name: 'Community', href: '/admin/community', icon: MessageSquare },
  { name: 'System', href: '/admin/system', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function AdminSidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Logout failed");
      return;
    }
    toast.success("Logged out");
    router.replace("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className={cn("transition-opacity", isCollapsed && "opacity-0 hidden")}>
            <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Admin Panel
            </div>
            <div className="text-xs text-gray-500">SnapStudio Management</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return isCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
                      isActive ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-orange-600 rounded-r-full" />
                )}
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-600")} />
                <div className="flex-1 truncate">
                  {item.name}
                </div>
              </Link>
            );
          })}
        </TooltipProvider>
      </nav>
      <div className="p-4 space-y-3 border-t">
        <Link href="/dashboard">
          <Button 
            variant="ghost"
            className={cn("w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200", isCollapsed && "justify-center")}
          >
            <Home className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
            <span className={cn(isCollapsed && "hidden")}>Go to Dashboard</span>
          </Button>
        </Link>
        <Button 
          variant="ghost"
          className={cn("w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200", isCollapsed && "justify-center")}
          onClick={handleLogout}
        >
          <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
          <span className={cn(isCollapsed && "hidden")}>Logout</span>
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const isMobile = useIsMobile();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-20 bg-white/80 backdrop-blur-sm">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full z-10 border-r border-gray-100 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <AdminSidebarContent />
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border rounded-full h-8 w-8 hover:bg-gray-100"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
      </Button>
    </div>
  );
}