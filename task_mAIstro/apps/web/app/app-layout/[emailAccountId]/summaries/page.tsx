import SummariesClient from "./SummariesClient";

export const metadata = {
  title: "AI Summaries",
};

type PageParams = {
  params: Promise<{ emailAccountId: string }>;
  searchParams?: Promise<{ view?: string }>;
};

const allowedViews = new Set(["inbox", "important", "unread", "all"]);

export default async function SummariesPage({
  params,
  searchParams,
}: PageParams) {
  const resolvedParams = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;

  const requestedView = resolvedSearch?.view;
  const initialView = allowedViews.has(requestedView ?? "")
    ? (requestedView as "inbox" | "important" | "unread" | "all")
    : "inbox";

  return (
    <SummariesClient
      emailAccountId={resolvedParams.emailAccountId}
      initialView={initialView}
    />
  );
}
