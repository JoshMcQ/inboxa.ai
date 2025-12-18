"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { whitelistInboxaAIAction } from "@/utils/actions/whitelist";
import {
  analyzeWritingStyleAction,
  assessAction,
} from "@/utils/actions/assess";
import { useAccount } from "@/providers/EmailAccountProvider";

export function AssessUser() {
  const { emailAccountId } = useAccount();
  const { executeAsync: executeAssessAsync } = useAction(
    assessAction.bind(null, emailAccountId),
  );
  const { execute: executeWhitelistInboxaAI } = useAction(
    whitelistInboxaAIAction.bind(null, emailAccountId),
  );
  const { execute: executeAnalyzeWritingStyle } = useAction(
    analyzeWritingStyleAction.bind(null, emailAccountId),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once
  useEffect(() => {
    if (!emailAccountId) return;

    async function assess() {
      const result = await executeAssessAsync();
      // no need to run this over and over after the first time
      if (!result?.data?.skipped) {
        executeWhitelistInboxaAI();
      }
    }

    assess();
    executeAnalyzeWritingStyle();
  }, [emailAccountId]);

  return null;
}
