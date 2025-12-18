export type SampleEmail = {
  id: string;
  from: string;
  subject: string;
  text?: string;
  headers?: Record<string, string>;
  date?: string;
};

export const sampleEmails: SampleEmail[] = [
  {
    id: "1",
    from: "Deals <promo@mailchimp.com>",
    subject: "Limited time offer - 50% off",
    text: "Save big with this promo. Click to redeem.",
    headers: { "List-Unsubscribe": "<mailto:unsub@example.com>" },
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    from: "Weekly Digest <updates@news.mail>",
    subject: "Your Weekly Newsletter: Top Stories",
    text: "This edition covers product updates and insights.",
    headers: { "List-Id": "<list.example.com>" },
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    from: "no-reply@shop.example",
    subject: "Order confirmation #12345",
    text: "Your order has shipped. Expected by Friday.",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    from: "CEO <ceo@acme.com>",
    subject: "Meeting today - review proposal by EOD",
    text: "Please review the docs and be ready for a 3pm call.",
    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    from: "friend@example.com",
    subject: "Hey",
    text: "Long time no see. Want to catch up next week?",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
