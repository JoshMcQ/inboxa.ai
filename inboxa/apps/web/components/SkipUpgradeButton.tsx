"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";

export function SkipUpgradeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Call our redirect API to get the proper app URL with emailAccountId
      const response = await fetch('/api/redirect-to-app', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(data.redirectUrl);
      } else {
        // Fallback to a generic redirect
        router.push('/app-layout');
      }
    } catch (error) {
      console.error('Error redirecting to app:', error);
      // Fallback to a generic redirect
      router.push('/app-layout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSkip}
      variant="outline"
      size="lg"
      disabled={loading}
      className="mt-8"
    >
      {loading ? (
        "Redirecting..."
      ) : (
        <>
          Skip upgrade and continue to app
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}