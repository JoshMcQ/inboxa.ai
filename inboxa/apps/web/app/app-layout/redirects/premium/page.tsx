import { redirectToEmailAccountPath } from "@/utils/account";

export default async function PremiumRedirectPage() {
  await redirectToEmailAccountPath("/premium");
}