import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { CareersPageContent } from "./CareersPageContent";

export const metadata: Metadata = {
  title: "Careers - InboxaAI",
  description: "Join our team and help build the future of AI-powered email management",
};

export default function CareersPage() {
  return (
    <BasicLayout>
      <CareersPageContent />
    </BasicLayout>
  );
}