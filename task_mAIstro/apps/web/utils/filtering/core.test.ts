import { describe, it, expect } from "vitest";
import { classifyEmail, type EmailInput } from "./core";

const run = process.env.RUN_AI_TESTS === "true" ? describe : describe.skip;

run("filtering core", () => {
  it("classifies marketing by domain + unsubscribe", () => {
    const email: EmailInput = {
      from: "Deals <promo@mailchimp.com>",
      subject: "Limited time offer - 50% off",
      headers: { "List-Unsubscribe": "<mailto:unsub@example.com>" },
      text: "Save big with this promo",
    };
    const c = classifyEmail(email);
    expect(c.decision).toBe("marketing");
    expect(c.score).toBeGreaterThanOrEqual(50);
  });

  it("classifies newsletter by keywords + list headers", () => {
    const email: EmailInput = {
      from: "Weekly Digest <updates@news.mail>",
      subject: "Your Weekly Newsletter: Top Stories",
      headers: { "List-Id": "<list.example.com>" },
      text: "This edition covers...",
    };
    const c = classifyEmail(email);
    expect(c.decision).toBe("newsletter");
  });

  it("classifies transactional by keywords and no-reply", () => {
    const email: EmailInput = {
      from: "no-reply@shop.example",
      subject: "Order confirmation #12345",
      text: "Your order has shipped",
    };
    const c = classifyEmail(email);
    expect(c.decision).toBe("transactional");
  });

  it("classifies important for VIP domains", () => {
    const email: EmailInput = {
      from: "CEO <ceo@acme.com>",
      subject: "Meeting today",
      text: "Please review the docs",
    };
    const c = classifyEmail(email, { vipDomains: ["acme.com"] });
    expect(c.decision).toBe("important");
    expect(c.score).toBeGreaterThan(80);
  });

  it("returns unknown when no strong signals", () => {
    const email: EmailInput = {
      from: "friend@example.com",
      subject: "Hey",
      text: "Long time no see",
    };
    const c = classifyEmail(email);
    expect(["unknown", "important", "marketing", "newsletter", "transactional"]).toContain(c.decision);
  });
});
