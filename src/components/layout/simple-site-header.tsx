"use client";

import Link from "next/link";
import { Building2, LogIn } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const industries = [
  { 
    href: "/food-beverage", 
    title: "Food & Beverage", 
    description: "Food & Drinks",
    color: "text-orange-600"
  },
  { 
    href: "/beauty-personal-care", 
    title: "Beauty & Personal Care", 
    description: "Cosmetics & Personal Care",
    color: "text-pink-600"
  },
  { 
    href: "/fashion-accessories", 
    title: "Fashion & Accessories", 
    description: "Fashion & Accessories",
    color: "text-purple-600"
  },
  { 
    href: "/mother-baby", 
    title: "Mother & Baby", 
    description: "Mother & Baby",
    color: "text-blue-600"
  },
];

export function SimpleSiteHeader() {
  return (
    <nav className="fixed top-0 left-0 right-0 glass-effect z-50 border-b border-gray-200/20">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold gradient-text">SnapStudio</Link>
        
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-blue-50 text-gray-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Industries
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4">
                    {industries.map((industry) => (
                      <NavigationMenuLink key={industry.href} asChild>
                        <Link
                          href={industry.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className={cn("text-sm font-medium leading-none", industry.color)}>
                            {industry.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {industry.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="/templates" className="text-gray-700 hover:text-blue-600 transition-colors">
            Templates
          </Link>
          <Link href="/#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
            Pricing
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 focus-ring"
          >
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}