/**
 * Converts natural language date queries to Gmail search syntax
 * @param query - The natural language query (e.g., "today", "yesterday")
 * @param timezone - Optional timezone offset in hours (e.g., -5 for EST). Defaults to server timezone.
 */
export function parseNaturalLanguageQuery(query: string, timezone?: number): string {
  const lowerQuery = query.toLowerCase().trim();

  // Get today's date in the specified timezone
  const now = new Date();

  // If timezone is provided, adjust the date
  let today: Date;
  if (timezone !== undefined) {
    // Convert to UTC, then apply timezone offset
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    today = new Date(utcTime + (timezone * 3600000));
  } else {
    today = now;
  }

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}/${mm}/${dd}`;

  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}/${String(yesterday.getMonth() + 1).padStart(2, "0")}/${String(yesterday.getDate()).padStart(2, "0")}`;

  // This week (last 7 days)
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = `${lastWeek.getFullYear()}/${String(lastWeek.getMonth() + 1).padStart(2, "0")}/${String(lastWeek.getDate()).padStart(2, "0")}`;

  // Simple date parsing only - NO complex operator extraction
  // Sender filtering should use the fromEmail parameter, not query string parsing
  let dateFilter = '';

  if (lowerQuery === "today" || lowerQuery.includes("today")) {
    dateFilter = `after:${todayStr}`;
  } else if (lowerQuery === "yesterday" || lowerQuery.includes("yesterday")) {
    dateFilter = `after:${yesterdayStr}`;
  } else if (lowerQuery.includes("this week") || lowerQuery.includes("last 7 days")) {
    dateFilter = `after:${lastWeekStr}`;
  } else if (lowerQuery.includes("this month")) {
    const firstOfMonth = `${yyyy}/${mm}/01`;
    dateFilter = `after:${firstOfMonth}`;
  }

  // If we found a date filter, return it with in:inbox category:primary
  // category:primary filters to Primary tab only (excludes Promotions, Social, Updates, Forums)
  if (dateFilter) {
    return `${dateFilter} in:inbox category:primary`;
  }

  // If it already looks like a Gmail query, return as-is
  if (
    lowerQuery.includes("after:") ||
    lowerQuery.includes("from:") ||
    lowerQuery.includes("subject:") ||
    lowerQuery.includes("in:")
  ) {
    return query;
  }

  // Default: search in inbox Primary tab only
  return `in:inbox category:primary`;
}
