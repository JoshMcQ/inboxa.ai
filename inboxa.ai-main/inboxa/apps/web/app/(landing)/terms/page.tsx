import type { Metadata } from "next";
import { TermsContent } from "@/app/(landing)/terms/content";

export const metadata: Metadata = {
  title: "Terms of Service - InboxaAI",
  description: "Terms of Service - InboxaAI",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <TermsContent />;
}
