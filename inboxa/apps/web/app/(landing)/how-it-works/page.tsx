import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { HowItWorksPageContent } from "./HowItWorksPageContent";

export const metadata: Metadata = {
  title: "How It Works - InboxaAI",
  description: "Learn how InboxaAI transforms your email experience in just a few simple steps",
};

export default function HowItWorksPage() {
  return (
    <BasicLayout>
      <HowItWorksPageContent />
    </BasicLayout>
  );
}