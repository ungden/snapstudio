"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ReferralHandler() {
  // Temporarily disabled - will be re-enabled in future version
  return null;
  
  /* 
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Capture and store referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      localStorage.setItem('snapstudio_referral_code', refCode);
      
      // Show welcome message for referred users
      toast.success(`🎉 Welcome! You were referred by affiliate ${refCode}`, {
        duration: 5000,
      });
    }
  }, [searchParams]);

  // Show referral banner if there's a referral code
  if (referralCode) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          🎉 You were referred by affiliate <span className="font-bold">{referralCode}</span> -
          Sign up now for a special offer!
        </p>
      </div>
    );
  }

  return null;
  */
}