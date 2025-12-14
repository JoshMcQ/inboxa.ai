import { redirectToEmailAccountPath } from "@/utils/account";

export default async function AppLayoutPage() {
  await redirectToEmailAccountPath("/setup");
}