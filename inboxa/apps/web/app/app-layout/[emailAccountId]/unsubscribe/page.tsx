import { PermissionsCheck } from "@/app/app-layout/[emailAccountId]/PermissionsCheck";
import { SendersIntelligence } from "./SendersIntelligence";

export default async function SendersPage() {
  return (
    <>
      <PermissionsCheck />
      <SendersIntelligence />
    </>
  );
}