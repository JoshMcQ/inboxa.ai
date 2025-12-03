// Stats actions removed with new architecture (no longer storing full emails)
// These are stubs to prevent build errors

export async function getStats() {
  throw new Error("Stats have been removed - no longer storing full emails in database");
}

export async function loadEmailStatsAction(
  emailAccountId: string,
  options?: { loadBefore?: boolean }
) {
  // No-op: Stats loading removed in new architecture
  return { success: true, message: "Stats functionality removed" };
}
