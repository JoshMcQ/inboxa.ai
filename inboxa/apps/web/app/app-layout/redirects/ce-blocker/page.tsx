import { redirectToEmailAccountPath } from "@/utils/account";

export default async function ColdEmailBlockerPage() {
  await redirectToEmailAccountPath("/ce-blocker");
}
