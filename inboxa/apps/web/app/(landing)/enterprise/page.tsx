import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { EnterprisePageContent } from "./EnterprisePageContent";

export const metadata: Metadata = {
  title: "Enterprise - InboxaAI",
  description: "Built for scale, security, and control. Transform email for your entire organization.",
};

export default function EnterprisePage() {
  return (
    <BasicLayout>
      <EnterprisePageContent />
    </BasicLayout>
  );
}