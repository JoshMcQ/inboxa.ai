"use client";

import { Chat } from "@/components/assistant-chat/chat";
import { CardBasic } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecksIcon, ReplyIcon, SlidersIcon } from "lucide-react";
import { PageHeading, TypographyP } from "@/components/Typography";
import { ASSISTANT_ONBOARDING_COOKIE, markOnboardingAsCompleted } from "@/utils/cookies";

export function AssistantPageClient({
  emailAccountId,
  showOnboarding,
}: {
  emailAccountId: string;
  showOnboarding?: boolean;
}) {
  if (showOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <PageHeading>Welcome to your AI Personal Assistant</PageHeading>
            <TypographyP>
              Your personal assistant helps manage your inbox by following your
              instructions and automating routine tasks.
            </TypographyP>
          </div>

          <div className="grid gap-4 text-sm">
            <CardBasic className="flex items-center p-4">
              <ListChecksIcon className="mr-3 size-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Create automation rules</h3>
                <p className="text-gray-600">Set up rules to automatically handle common email patterns</p>
              </div>
            </CardBasic>

            <CardBasic className="flex items-center p-4">
              <ReplyIcon className="mr-3 size-5 text-green-500" />
              <div>
                <h3 className="font-medium">AI-powered replies</h3>
                <p className="text-gray-600">Generate smart responses based on your writing style</p>
              </div>
            </CardBasic>

            <CardBasic className="flex items-center p-4">
              <SlidersIcon className="mr-3 size-5 text-purple-500" />
              <div>
                <h3 className="font-medium">Intelligent management</h3>
                <p className="text-gray-600">Automatically categorize and organize your emails</p>
              </div>
            </CardBasic>
          </div>

          <div className="text-center space-y-4">
            <Button
              onClick={() => {
                // Mark onboarding as completed using the proper helper
                markOnboardingAsCompleted(ASSISTANT_ONBOARDING_COOKIE);
                // Reload to show the main assistant
                window.location.reload();
              }}
              size="lg"
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
            <p className="text-sm text-gray-500">
              Click "Get Started" to begin setting up your AI assistant
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
      <Chat emailAccountId={emailAccountId} />
    </div>
  );
}
