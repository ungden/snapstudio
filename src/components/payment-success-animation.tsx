"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, CreditCard, ArrowRight, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentSuccessAnimationProps {
  planName: string;
  pointsReceived: number;
  amountPaid: number;
  billingPeriod: 'monthly' | 'yearly';
  onContinue: () => void;
}

export function PaymentSuccessAnimation({ 
  planName, 
  pointsReceived, 
  amountPaid, 
  billingPeriod,
  onContinue 
}: PaymentSuccessAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Trigger animations with delays
    setTimeout(() => setShowAnimation(true), 100);
    setTimeout(() => setShowDetails(true), 800);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          {/* Success Icon with Animation */}
          <div className={cn(
            "transition-all duration-1000 transform",
            showAnimation ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}>
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-bounce animation-delay-200">
                <Sparkles className="w-5 h-5 text-blue-500" />
              </div>
              <div className="absolute top-0 left-0 animate-bounce animation-delay-400">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className={cn(
            "transition-all duration-1000 delay-300 transform",
            showAnimation ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Welcome to the <span className="font-bold text-blue-600">{planName}</span> plan
            </p>
          </div>

          {/* Payment Details */}
          <div className={cn(
            "transition-all duration-1000 delay-500 transform space-y-6",
            showDetails ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            {/* Points Received */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Gift className="w-8 h-8" />
                <span className="text-2xl font-bold">Points Added!</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                +{pointsReceived.toLocaleString()}
              </div>
              <div className="text-blue-100">
                points added to your account
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Plan purchased</div>
                <div className="font-bold text-gray-900">{planName}</div>
                <Badge className="mt-1 bg-blue-100 text-blue-700">
                  {billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}
                </Badge>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Amount paid</div>
                <div className="font-bold text-gray-900">
                  {amountPaid.toLocaleString()} VND
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Points/month</div>
                <div className="font-bold text-gray-900">
                  {(pointsReceived / (billingPeriod === 'yearly' ? 12 : 1)).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3">🚀 Next steps:</h3>
              <ul className="text-left space-y-2 text-gray-700 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Start creating images with {pointsReceived.toLocaleString()} points
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Explore 4 styles: Display, Model, Social, Seeding
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {billingPeriod === 'yearly' ?
                    `Receive ${(pointsReceived / 12).toLocaleString()} more points each month for the next 11 months` :
                    'Renew your plan before running out of points'
                  }
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={onContinue}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start creating images now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Thank you for choosing SnapStudio! 🙏
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}