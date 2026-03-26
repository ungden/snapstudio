"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Home, Settings, CreditCard, LogOut, Heart, Users, Folder, Sparkles, History, Shield,
  ChevronsLeft, ChevronsRight, Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { useSidebar } from '@/components/sidebar-provider';
import { useIsMobile } from '@/hooks/use-mobile';

const supabase = createSupabaseBrowserClient();

const navigation = [
  { name: 'Create Images', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'Favorites', href: '/dashboard/favorites', icon: Heart },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Points History', href: '/dashboard/points-history', icon: History },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const { isCollapsed } = useSidebar();

  const navItems = [...navigation];
  if (profile?.subscription_plan === 'admin') {
    navItems.splice(-1, 0, { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: Shield 
    });
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message || 'Logout failed');
        return;
      }
      toast.success('Logged out');
      router.replace('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className={cn("transition-opacity", isCollapsed && "opacity-0 hidden")}>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SnapStudio
              </div>
              <div className="text-xs text-gray-500">AI Studio</div>
            </div>
          </Link>
          
          <div className={cn(isCollapsed && "hidden")}>
            <NotificationsDropdown />
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/community' && pathname.startsWith('/community'));
            const isAdminLink = item.href === '/admin';
            
            return isCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
                      isActive
                        ? isAdminLink ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                  "group flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? isAdminLink 
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4", 
                  isActive 
                    ? isAdminLink ? "text-red-600" : "text-blue-600"
                    : "text-gray-400"
                )} />
                <span className="text-sm truncate">{item.name}</span>
                {isAdminLink && (
                  <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5 ml-auto">
                    ADMIN
                  </Badge>
                )}
              </Link>
            );
          })}
        </TooltipProvider>
      </nav>
      
      <div className="p-3 space-y-3">
        <Card className={cn("bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 transition-all", isCollapsed && "p-1")}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className={cn("font-medium text-sm", isCollapsed && "hidden")}>Points</span>
              </div>
              {profile?.subscription_plan === 'admin' && !isCollapsed && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  ADMIN
                </Badge>
              )}
            </div>
            <div className={cn("text-xl font-bold mb-2", isCollapsed && "text-center")}>
              {(profile?.points_balance ?? 0).toLocaleString()}
            </div>
            <Button 
              size="sm" 
              className={cn("w-full bg-white/20 hover:bg-white/30 text-white border-0 text-xs py-1", isCollapsed && "hidden")}
              onClick={() => router.push('/dashboard/billing')}
            >
              Top Up
            </Button>
          </CardContent>
        </Card>
        <Button 
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 text-sm py-2", isCollapsed && "justify-center")}
          onClick={handleLogout}
        >
          <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
          <span className={cn(isCollapsed && "hidden")}>Log Out</span>
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
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
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full z-10 border-r border-gray-100 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <SidebarContent />
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