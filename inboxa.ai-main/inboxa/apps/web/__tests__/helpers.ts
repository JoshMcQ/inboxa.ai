import type { EmailAccountWithAI } from "@/utils/llms/types";
import type { EmailForLLM } from "@/utils/types";

export function getEmailAccount(): EmailAccountWithAI {
  return {
    id: "email-account-id",
    userId: "user1",
    email: "user@test.com",
    about: null,
    user: {
      aiModel: null,
      aiProvider: null,
      aiApiKey: null,
    },
  };
}

export function getEmail({
  from = "user@test.com",
  subject = "Test Subject",
  content = "Test content",
  replyTo,
  cc,
}: Partial<EmailForLLM> = {}): EmailForLLM {
  return {
    id: "email-id",
    from,
    to: "recipient@test.com",
    subject,
    content,
    date: new Date(),
    ...(replyTo && { replyTo }),
    ...(cc && { cc }),
  };
}
