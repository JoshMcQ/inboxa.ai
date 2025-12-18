import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { ContactPageContent } from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Contact - InboxaAI",
  description: "Get in touch with the InboxaAI team. We're here to help with questions, feedback, and support",
};

export default function ContactPage() {
  return (
    <BasicLayout>
      <ContactPageContent />
    </BasicLayout>
  );
}