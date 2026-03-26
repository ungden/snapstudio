"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Star, Sparkles, CreditCard, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type IndustryId = 'f_b' | 'beauty' | 'fashion' | 'mother_baby' | 'other';

type Plan = {
  id: string;
  name: string;
  points: number;
  priceUsd: number;
  popular?: boolean;
  premium?: boolean;
  theme: {
    gradient: string;
    bg: string;
    text: string;
    border: string;
    button: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  yearly?: boolean;
  discountNote?: string;
  features: string[];
  industryExamples: {
    f_b: string;
    beauty: string;
    fashion: string;
    mother_baby: string;
    other: string;
  };
  highlight?: string;
  savings?: string;
};

const USD_VND_RATE = 26400;

function usdToVnd(usd: number) {
  const raw = usd * USD_VND_RATE;
  return Math.round(raw / 1000) * 1000;
}

const monthlyPlans: Plan[] = [
  { 
    id: "starter_monthly", 
    name: "Starter", 
    points: 1200,
    priceUsd: 5,
    theme: {
      gradient: "from-yellow-400 to-orange-500",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      button: "bg-yellow-500 hover:bg-yellow-600",
      icon: Star
    },
    features: [
      "1,200 pts/month", 
      "~10 bộ ảnh (120 pts/bộ)", 
      "All 4 styles", 
      "HD downloads",
      "Community access"
    ],
    industryExamples: {
      f_b: "~10 dishes/month",
      beauty: "~10 beauty products/month", 
      fashion: "~10 outfits/products/month",
      mother_baby: "~10 baby products/month",
      other: "~10 tech products/month"
    },
    highlight: "Great for startups"
  },
  { 
    id: "pro_monthly", 
    name: "Pro", 
    points: 5000,
    priceUsd: 20, 
    popular: true,
    theme: {
      gradient: "from-blue-500 to-purple-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      button: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      icon: Zap
    },
    features: [
      "5,000 pts/month", 
      "~41 bộ ảnh (120 pts/bộ)", 
      "All Starter features", 
      "Priority support",
      "Advanced templates",
      "Bulk download"
    ],
    industryExamples: {
      f_b: "~41 dishes/month",
      beauty: "~41 beauty products/month",
      fashion: "~41 outfits/products/month", 
      mother_baby: "~41 baby products/month",
      other: "~41 tech products/month"
    },
    highlight: "Most popular choice",
    savings: "Save 75% vs studio"
  },
  { 
    id: "business_monthly", 
    name: "Business", 
    points: 15000,
    priceUsd: 60,
    theme: {
      gradient: "from-purple-500 to-indigo-600",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      button: "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
      icon: Crown
    },
    features: [
      "15,000 pts/month", 
      "~125 bộ ảnh (120 pts/bộ)", 
      "All Pro features", 
      "Unlimited history",
      "API access",
      "Custom branding",
      "Team collaboration"
    ],
    industryExamples: {
      f_b: "~125 dishes/month",
      beauty: "~125 beauty products/month",
      fashion: "~125 outfits/products/month",
      mother_baby: "~125 baby products/month", 
      other: "~125 tech products/month"
    },
    highlight: "For mid-size businesses",
    savings: "ROI 500%+"
  },
  { 
    id: "enterprise_monthly", 
    name: "Enterprise", 
    points: 50000,
    priceUsd: 199,
    premium: true,
    theme: {
      gradient: "from-gray-800 to-black",
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-300",
      button: "bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800",
      icon: Crown
    },
    features: [
      "50,000 pts/month", 
      "~416 bộ ảnh (120 pts/bộ)", 
      "All Business features", 
      "Dedicated support",
      "Custom integrations",
      "White-label solution",
      "SLA guarantee",
      "Priority processing"
    ],
    industryExamples: {
      f_b: "~416 dishes/month",
      beauty: "~416 beauty products/month",
      fashion: "~416 outfits/products/month",
      mother_baby: "~416 baby products/month",
      other: "~416 tech products/month"
    },
    highlight: "Enterprise solution",
    savings: "Unlimited scale"
  },
];

const yearlyPlans: Plan[] = [
  { 
    id: "starter_yearly", 
    name: "Starter", 
    points: 1200,
    priceUsd: 50,
    yearly: true, 
    discountNote: "Save 17%",
    theme: {
      gradient: "from-yellow-400 to-orange-500",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      button: "bg-yellow-500 hover:bg-yellow-600",
      icon: Star
    },
    features: [
      "1,200 pts/month × 12 months", 
      "One-time annual payment", 
      "All templates", 
      "HD downloads",
      "Email support"
    ],
    industryExamples: {
      f_b: "~10 dishes/month × 12 months",
      beauty: "~10 beauty products/month × 12 months",
      fashion: "~10 outfits/month × 12 months",
      mother_baby: "~10 baby products/month × 12 months",
      other: "~10 products/month × 12 months"
    },
    highlight: "Save for the whole year",
    savings: "Save $10/year"
  },
  { 
    id: "pro_yearly", 
    name: "Pro", 
    points: 5000,
    priceUsd: 200,
    popular: true,
    yearly: true, 
    discountNote: "Save 17%",
    theme: {
      gradient: "from-blue-500 to-purple-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      button: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      icon: Zap
    },
    features: [
      "5,000 pts/month × 12 months", 
      "One-time annual payment", 
      "Priority support",
      "Advanced features",
      "Bulk operations",
      "Analytics dashboard"
    ],
    industryExamples: {
      f_b: "~41 dishes/month × 12 months",
      beauty: "~41 beauty products/month × 12 months",
      fashion: "~41 outfits/month × 12 months",
      mother_baby: "~41 baby products/month × 12 months", 
      other: "~41 products/month × 12 months"
    },
    highlight: "Best choice",
    savings: "Save $40/year"
  },
  { 
    id: "business_yearly", 
    name: "Business", 
    points: 15000,
    priceUsd: 600,
    yearly: true, 
    discountNote: "Save 17%",
    theme: {
      gradient: "from-purple-500 to-indigo-600",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      button: "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
      icon: Crown
    },
    features: [
      "15,000 pts/month × 12 months", 
      "One-time annual payment", 
      "Team management",
      "API access",
      "Custom branding",
      "Dedicated support"
    ],
    industryExamples: {
      f_b: "~125 dishes/month × 12 months",
      beauty: "~125 beauty products/month × 12 months",
      fashion: "~125 outfits/month × 12 months",
      mother_baby: "~125 baby products/month × 12 months",
      other: "~125 products/month × 12 months"
    },
    highlight: "For businesses",
    savings: "Save $120/year"
  },
  { 
    id: "enterprise_yearly", 
    name: "Enterprise", 
    points: 50000,
    priceUsd: 1990,
    premium: true,
    yearly: true, 
    discountNote: "Save 17%",
    theme: {
      gradient: "from-gray-800 to-black",
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-300",
      button: "bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800",
      icon: Crown
    },
    features: [
      "50,000 pts/month × 12 months", 
      "One-time annual payment", 
      "White-label solution",
      "Custom integrations",
      "SLA guarantee",
      "24/7 support",
      "Dedicated account manager"
    ],
    industryExamples: {
      f_b: "~416 dishes/month × 12 months",
      beauty: "~416 beauty products/month × 12 months", 
      fashion: "~416 outfits/month × 12 months",
      mother_baby: "~416 baby products/month × 12 months",
      other: "~416 products/month × 12 months"
    },
    highlight: "Comprehensive solution",
    savings: "Save $398/year"
  },
];

interface EnhancedPricingPlansProps {
  onPlanSelect?: (planId: string) => void;
  selectedIndustry?: IndustryId | null;
  showIndustryFilter?: boolean;
}

export default function EnhancedPricingPlans({ 
  onPlanSelect, 
  selectedIndustry = null,
  showIndustryFilter = true 
}: EnhancedPricingPlansProps) {
  const [yearly, setYearly] = useState(true);
  const [industryFilter, setIndustryFilter] = useState<IndustryId | null>(selectedIndustry);
  const plans = yearly ? yearlyPlans : monthlyPlans;

  const handlePlanSelect = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    } else {
      // Default behavior - navigate to billing
      if (typeof window !== 'undefined') {
        window.location.href = `/dashboard/billing?plan=${planId}`;
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 text-sm font-semibold">Flexible Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose the right plan for your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> scale </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Yearly saves 17% — points allocated monthly, never expire
          </p>
          
          {/* Industry Filter */}
          {showIndustryFilter && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Button
                variant={industryFilter === null ? "default" : "outline"}
                onClick={() => setIndustryFilter(null)}
                size="sm"
                className="rounded-full"
              >
                All Industries
              </Button>
              {[
                { value: 'f_b', label: '🍔 F&B', color: 'hover:bg-orange-50' },
                { value: 'beauty', label: '💄 Beauty', color: 'hover:bg-pink-50' },
                { value: 'fashion', label: '👕 Fashion', color: 'hover:bg-purple-50' },
                { value: 'mother_baby', label: '👶 Mom&Baby', color: 'hover:bg-blue-50' },
                { value: 'other', label: '📱 Tech', color: 'hover:bg-gray-50' }
              ].map((industry) => (
                <Button
                  key={industry.value}
                  variant={industryFilter === industry.value ? "default" : "outline"}
                  onClick={() => setIndustryFilter(industry.value as IndustryId)}
                  size="sm"
                  className={cn("rounded-full", industry.color)}
                >
                  {industry.label}
                </Button>
              ))}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 max-w-3xl mx-auto border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>💡 Savings tip:</strong> Batch Mode (120 pts = 12 images) is 3x cheaper than Solo Mode (30 pts = 1 image)
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-xl border border-gray-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setYearly(false)}
                className={cn(
                  "px-6 py-3 rounded-full font-semibold transition-all duration-300",
                  !yearly 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={cn(
                  "px-6 py-3 rounded-full font-semibold transition-all duration-300 relative",
                  yearly 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Yearly
                {yearly && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 animate-pulse">
                    -17%
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.theme.icon;
            const vnd = usdToVnd(plan.priceUsd);
            const monthlyUsd = plan.yearly ? plan.priceUsd / 12 : null;
            const monthlyVnd = plan.yearly ? vnd / 12 : null;

            // Get industry-specific example
            const industryExample = industryFilter && plan.industryExamples 
              ? plan.industryExamples[industryFilter]
              : null;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-500 hover:scale-105 group",
                  plan.popular 
                    ? "ring-4 ring-blue-500/50 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 transform scale-105" 
                    : plan.premium
                    ? "ring-2 ring-gray-400/30 shadow-xl bg-gradient-to-br from-gray-50 to-white"
                    : "shadow-lg hover:shadow-xl bg-white border-2 border-gray-100"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-center py-3 text-sm font-bold animate-gradient-x">
                    🔥 MOST POPULAR
                  </div>
                )}

                {/* Premium Badge */}
                {plan.premium && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-black text-white text-center py-3 text-sm font-bold">
                    👑 ENTERPRISE
                  </div>
                )}

                <CardHeader className={cn(
                  "text-center relative",
                  plan.popular ? 'pt-16 pb-6' : plan.premium ? 'pt-16 pb-6' : 'pt-8 pb-6'
                )}>
                  {/* Plan Icon */}
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto shadow-lg",
                    `bg-gradient-to-br ${plan.theme.gradient}`
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                    {plan.name}
                  </CardTitle>

                  {/* Discount Badge */}
                  {plan.discountNote && (
                    <Badge className="mb-4 bg-green-500 text-white px-3 py-1 animate-bounce">
                      {plan.discountNote}
                    </Badge>
                  )}

                  {/* Pricing */}
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.priceUsd.toLocaleString()}
                    </span>
                    <span className="text-gray-500 ml-2 text-lg">
                      {plan.yearly ? "/year" : "/month"}
                    </span>
                  </div>

                  <div className="text-xl font-semibold text-blue-600 mb-2">
                    {vnd.toLocaleString()}₫
                  </div>

                  {monthlyUsd && monthlyVnd && (
                    <div className="text-sm text-gray-500 mb-4">
                      ≈ ${monthlyUsd.toFixed(0)}/month ({Math.round(monthlyVnd/1000)}k₫/month)
                    </div>
                  )}

                  {/* Points Badge */}
                  <Badge 
                    className={cn(
                      "text-lg px-4 py-2 font-bold mb-4",
                      plan.theme.bg,
                      plan.theme.text,
                      plan.theme.border
                    )}
                  >
                    {plan.points.toLocaleString()} pts/month
                  </Badge>

                  {/* Highlight */}
                  {plan.highlight && (
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {plan.highlight}
                    </p>
                  )}

                  {/* Savings */}
                  {plan.savings && (
                    <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
                      💰 {plan.savings}
                    </Badge>
                  )}

                  {/* Industry-specific example */}
                  {industryExample && (
                    <div className="mt-4">
                      <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-sm px-3 py-1">
                        {industryExample}
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full py-4 font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
                      plan.popular
                        ? plan.theme.button + " text-white"
                        : plan.premium
                        ? plan.theme.button + " text-white"
                        : plan.theme.button + " text-white"
                    )}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular ? (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    ) : plan.premium ? (
                      <>
                        <Crown className="w-5 h-5 mr-2" />
                        Contact Sales
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        Choose {plan.name}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Value Proposition */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      {plan.yearly ? "Pay once, use all year" : "Flexible monthly billing"}
                    </p>
                  </div>
                </CardContent>

                {/* Decorative Elements */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-12 translate-x-8 -translate-y-8",
                  `bg-gradient-to-br ${plan.theme.gradient}`
                )}></div>
                
                {plan.popular && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Industry-specific ROI */}
        {industryFilter && (
          <div className="mt-16 max-w-5xl mx-auto">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-6">
                    {industryFilter === 'f_b' ? '🍔' : 
                     industryFilter === 'beauty' ? '💄' :
                     industryFilter === 'fashion' ? '👕' :
                     industryFilter === 'mother_baby' ? '👶' : '📱'}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    ROI Calculator for {industryFilter === 'f_b' ? 'F&B' : 
                                              industryFilter === 'beauty' ? 'Beauty' :
                                              industryFilter === 'fashion' ? 'Fashion' :
                                              industryFilter === 'mother_baby' ? 'Mom&Baby' : 'Tech'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="font-bold text-gray-900 mb-4 text-xl">Traditional Studio</h4>
                      <div className="space-y-3 text-gray-600">
                        {industryFilter === 'f_b' && (
                          <>
                            <div className="flex justify-between"><span>Photographer:</span><span className="font-semibold">3-8 M VND/session</span></div>
                            <div className="flex justify-between"><span>Food styling:</span><span className="font-semibold">1-3 M VND</span></div>
                            <div className="flex justify-between"><span>Studio rent:</span><span className="font-semibold">500k-2M/ngày</span></div>
                            <div className="flex justify-between"><span>Props & setup:</span><span className="font-semibold">500k-1M</span></div>
                            <div className="border-t pt-3 flex justify-between text-lg"><span className="font-bold">Total:</span><span className="font-bold text-red-600">5-14 M VND</span></div>
                          </>
                        )}
                        {industryFilter === 'beauty' && (
                          <>
                            <div className="flex justify-between"><span>Beauty photographer:</span><span className="font-semibold">5-15 M VND/session</span></div>
                            <div className="flex justify-between"><span>Makeup artist:</span><span className="font-semibold">2-5 M VND</span></div>
                            <div className="flex justify-between"><span>Model:</span><span className="font-semibold">2-8 M VND</span></div>
                            <div className="flex justify-between"><span>Studio & lighting:</span><span className="font-semibold">1-3 M VND</span></div>
                            <div className="border-t pt-3 flex justify-between text-lg"><span className="font-bold">Total:</span><span className="font-bold text-red-600">10-31 M VND</span></div>
                          </>
                        )}
                        {industryFilter === 'fashion' && (
                          <>
                            <div className="flex justify-between"><span>Fashion photographer:</span><span className="font-semibold">8-20 M VND/session</span></div>
                            <div className="flex justify-between"><span>Model:</span><span className="font-semibold">3-10 M VND</span></div>
                            <div className="flex justify-between"><span>Stylist:</span><span className="font-semibold">2-5 M VND</span></div>
                            <div className="flex justify-between"><span>Location/Studio:</span><span className="font-semibold">1-5 M VND</span></div>
                            <div className="border-t pt-3 flex justify-between text-lg"><span className="font-bold">Total:</span><span className="font-bold text-red-600">14-40 M VND</span></div>
                          </>
                        )}
                        {industryFilter === 'mother_baby' && (
                          <>
                            <div className="flex justify-between"><span>Baby photographer:</span><span className="font-semibold">5-12 M VND/session</span></div>
                            <div className="flex justify-between"><span>Baby model:</span><span className="font-semibold">2-5 M VND</span></div>
                            <div className="flex justify-between"><span>Props & safety:</span><span className="font-semibold">1-3 M VND</span></div>
                            <div className="flex justify-between"><span>Studio setup:</span><span className="font-semibold">1-2 M VND</span></div>
                            <div className="border-t pt-3 flex justify-between text-lg"><span className="font-bold">Total:</span><span className="font-bold text-red-600">9-22 M VND</span></div>
                          </>
                        )}
                        {industryFilter === 'other' && (
                          <>
                            <div className="flex justify-between"><span>Product photographer:</span><span className="font-semibold">3-10 M VND/session</span></div>
                            <div className="flex justify-between"><span>Studio & equipment:</span><span className="font-semibold">1-3 M VND</span></div>
                            <div className="flex justify-between"><span>Post-processing:</span><span className="font-semibold">500k-2M</span></div>
                            <div className="flex justify-between"><span>Retouching:</span><span className="font-semibold">500k-1M</span></div>
                            <div className="border-t pt-3 flex justify-between text-lg"><span className="font-bold">Total:</span><span className="font-bold text-red-600">5-16 M VND</span></div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                      <h4 className="font-bold mb-4 text-xl">SnapStudio AI</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span>Upload ảnh:</span><span className="font-semibold">5 seconds</span></div>
                        <div className="flex justify-between"><span>AI processing:</span><span className="font-semibold">30 seconds</span></div>
                        <div className="flex justify-between"><span>12 multi-style images:</span><span className="font-semibold">Instant</span></div>
                        <div className="flex justify-between"><span>Cost:</span><span className="font-semibold">120 pts (~12k VND)</span></div>
                        <div className="border-t border-white/20 pt-3 flex justify-between text-lg"><span className="font-bold">Total:</span><span className="font-bold text-green-300">35 seconds, 12k VND</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <TrendingUp className="w-8 h-8" />
                      <p className="text-2xl font-bold">
                        Save 99.9% time and 99.9% cost!
                      </p>
                    </div>
                    <p className="text-green-100">
                      Từ hàng M VND VND xuống chỉ 12k VND cho 12 ảnh chuyên nghiệp
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Cần tư vấn gói phù hợp cho doanh nghiệp?
            </h3>
            <p className="text-gray-600 mb-6">
              Đội ngũ SnapStudio sẽ phân tích nhu cầu và đề xuất gói cước tối ưu cho business model của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
                onClick={() => window.location.href = '/contact'}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Tư vấn miễn phí
              </Button>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                onClick={() => handlePlanSelect('pro_yearly')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Bắt đầu với Pro
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}