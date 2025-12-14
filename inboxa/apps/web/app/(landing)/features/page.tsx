import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { FeaturesPageContent } from "./FeaturesPageContent";

export const metadata: Metadata = {
  title: "Features - InboxaAI",
  description: "Everything you need to transform your inbox from a burden into your competitive advantage",
};

export default function FeaturesPage() {
  return (
    <BasicLayout>
      <FeaturesPageContent />
    </BasicLayout>
  );
}