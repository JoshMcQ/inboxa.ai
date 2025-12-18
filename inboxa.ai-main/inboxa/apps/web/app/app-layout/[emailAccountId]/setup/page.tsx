import { redirect } from "next/navigation";

/**
 * Legacy /setup surface is deprecated.
 * Redirect to the new Home: /app-layout/[emailAccountId]/home
 */
export default async function SetupRedirect(props: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await props.params;
  redirect(`/app-layout/${emailAccountId}/home`);
}
