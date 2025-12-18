import { notFound } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";

export async function checkUserOwnsEmailAccount({
  emailAccountId,
}: {
  emailAccountId: string;
}) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) notFound();

  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId, userId },
    select: { id: true },
  });
  if (!emailAccount) notFound();
}

// Fetch an email account for a given user and include linked auth tokens needed for Gmail API
export async function getEmailAccountFromParams(
  { emailAccountId }: { emailAccountId: string },
  userId: string,
) {
  const emailAccount = await prisma.emailAccount.findFirst({
    where: { id: emailAccountId, userId },
    select: {
      id: true,
      userId: true,
      account: {
        select: {
          refresh_token: true,
          access_token: true,
          expires_at: true,
        },
      },
    },
  });

  if (!emailAccount) notFound();
  return emailAccount;
}
