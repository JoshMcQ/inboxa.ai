import type { Metadata } from "next";
import { HeroHome } from "@/app/(landing)/home/Hero";
import { SocialProof } from "@/app/(landing)/home/SocialProof";
import { CoreValueProps } from "@/app/(landing)/home/CoreValueProps";
import { HowItWorks } from "@/app/(landing)/home/HowItWorks";
import { FeatureHighlights } from "@/app/(landing)/home/FeatureHighlights";
import { Testimonials } from "@/app/(landing)/home/Testimonials";
import { PricingLazy } from "@/app/app-layout/premium/PricingLazy";
import { CTA } from "@/app/(landing)/home/CTA";
import { BasicLayout } from "@/components/layouts/BasicLayout";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <BasicLayout>
      <HeroHome />
      <SocialProof />
      <CoreValueProps />
      <HowItWorks />
      <FeatureHighlights />
      <Testimonials />
      <PricingLazy className="pb-32" />
      <CTA />
    </BasicLayout>
  );
}
