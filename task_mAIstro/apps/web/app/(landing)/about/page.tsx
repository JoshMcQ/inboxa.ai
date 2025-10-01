import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About - InboxaAI",
  description: "Learn about InboxaAI's mission to transform email management through AI-powered automation",
};

export default function AboutPage() {
  return (
    <BasicLayout>
      <AboutPageContent />
    </BasicLayout>
  );
}