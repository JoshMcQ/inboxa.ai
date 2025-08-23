import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing - InboxaAI",
  description: "Simple, transparent pricing for teams of all sizes",
};

export default function PricingPage() {
  return (
    <BasicLayout>
      <PricingPageContent />
    </BasicLayout>
  );
}