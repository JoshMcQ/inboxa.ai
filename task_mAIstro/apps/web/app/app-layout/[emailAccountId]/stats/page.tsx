import { PermissionsCheck } from "@/app/app-layout/[emailAccountId]/PermissionsCheck";
import { InboxInsights } from "./InboxInsights";

export default async function StatsPage() {
  return (
    <>
      <PermissionsCheck />
      <InboxInsights />
    </>
  );
}