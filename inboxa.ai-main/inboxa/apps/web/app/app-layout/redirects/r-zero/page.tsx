import { redirectToEmailAccountPath } from "@/utils/account";

export default async function ReplyManagerPage() {
  await redirectToEmailAccountPath("/r-zero");
}
