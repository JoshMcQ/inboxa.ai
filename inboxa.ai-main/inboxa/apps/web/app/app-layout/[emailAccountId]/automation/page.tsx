import { PermissionsCheck } from "@/app/app-layout/[emailAccountId]/PermissionsCheck";
import { RulesLab } from "./RulesLab";

export default async function AutomationPage() {
  return (
    <>
      <PermissionsCheck />
      <RulesLab />
    </>
  );
}