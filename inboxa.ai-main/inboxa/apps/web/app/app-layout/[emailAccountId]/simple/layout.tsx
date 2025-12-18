import { SimpleEmailStateProvider } from "@/app/app-layout/[emailAccountId]/simple/SimpleProgressProvider";

export default async function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SimpleEmailStateProvider>{children}</SimpleEmailStateProvider>;
}
