"use client";

import React from "react";
import { TopNav } from "@/components/TopNav";

/**
 * GlobalHeader
 * Facade over the existing TopNav so the app shell can import a stable header
 * component while we evolve TopNav internals without changing the shell.
 */
export function GlobalHeader(props: { trigger: React.ReactNode }) {
  return <TopNav trigger={props.trigger} />;
}

export default GlobalHeader;