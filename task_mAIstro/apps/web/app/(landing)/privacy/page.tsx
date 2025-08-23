import type { Metadata } from "next";
import { PrivacyContent } from "@/app/(landing)/privacy/content";

export const metadata: Metadata = {
  title: "Privacy Policy - InboxaAI",
  description: "Privacy Policy - InboxaAI",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <PrivacyContent />;
}
