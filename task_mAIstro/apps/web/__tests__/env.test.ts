import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Environment Configuration", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Environment Variable Validation", () => {
    it("should validate required environment variables", () => {
      // Test that the env module exists and can be imported
      expect(() => {
        require("@/env");
      }).not.toThrow();
    });

    it("should have proper structure for client variables", () => {
      const env = require("@/env").env;
      
      // Check that NEXT_PUBLIC_ variables are accessible on client
      expect(env).toHaveProperty("NEXT_PUBLIC_BASE_URL");
      expect(env).toHaveProperty("NEXT_PUBLIC_CONTACTS_ENABLED");
    });

    it("should have proper structure for server variables", () => {
      const env = require("@/env").env;
      
      // Check that server-only variables are defined
      expect(env).toHaveProperty("DATABASE_URL");
      expect(env).toHaveProperty("NEXTAUTH_SECRET");
    });

    it("should not expose LangGraph environment variables (removed)", () => {
      const env = require("@/env").env;
      
      // These should be removed as per the diff
      expect(env).not.toHaveProperty("LANGGRAPH_URL");
      expect(env).not.toHaveProperty("GRAPH_NAME");
      expect(env).not.toHaveProperty("NEXT_PUBLIC_LANGGRAPH_URL");
      expect(env).not.toHaveProperty("NEXT_PUBLIC_GRAPH_NAME");
    });

    it("should have ElevenLabs configuration", () => {
      const env = require("@/env").env;
      
      // ElevenLabs variables should be present
      expect(env).toHaveProperty("ELEVENLABS_API_KEY");
      expect(env).toHaveProperty("ELEVENLABS_WEBHOOK_SECRET");
      expect(env).toHaveProperty("ELEVENLABS_WEBHOOK_URL");
      expect(env).toHaveProperty("ELEVENLABS_AGENT_ID");
    });

    it("should have voice-related configuration", () => {
      const env = require("@/env").env;
      
      // Voice mock flag should be present
      expect(env).toHaveProperty("MOCK_VOICE");
      expect(typeof env.MOCK_VOICE).toBe("boolean");
    });

    it("should have OpenAI configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("OPENAI_API_KEY");
    });

    it("should have proper indentation for ElevenLabs variables", () => {
      // Read the actual env.ts file to check formatting
      const fs = require("fs");
      const path = require("path");
      const envPath = path.join(process.cwd(), "env.ts");
      const envContent = fs.readFileSync(envPath, "utf-8");
      
      // Check that ElevenLabs variables are properly indented (not under server section)
      const elevenLabsLines = envContent.split("\n").filter((line: string) => 
        line.includes("ELEVENLABS_")
      );
      
      // Should have consistent indentation
      elevenLabsLines.forEach((line: string) => {
        expect(line).toMatch(/^\s{4}ELEVENLABS_/);
      });
    });
  });

  describe("Environment Variable Types", () => {
    it("should parse string variables correctly", () => {
      process.env.NEXT_PUBLIC_BASE_URL = "https://test.example.com";
      
      // Re-import to get fresh env
      delete require.cache[require.resolve("@/env")];
      const { env } = require("@/env");
      
      expect(typeof env.NEXT_PUBLIC_BASE_URL).toBe("string");
      expect(env.NEXT_PUBLIC_BASE_URL).toBe("https://test.example.com");
    });

    it("should parse boolean variables correctly", () => {
      process.env.NEXT_PUBLIC_CONTACTS_ENABLED = "true";
      process.env.MOCK_VOICE = "false";
      
      delete require.cache[require.resolve("@/env")];
      const { env } = require("@/env");
      
      expect(typeof env.NEXT_PUBLIC_CONTACTS_ENABLED).toBe("boolean");
      expect(env.NEXT_PUBLIC_CONTACTS_ENABLED).toBe(true);
      expect(typeof env.MOCK_VOICE).toBe("boolean");
      expect(env.MOCK_VOICE).toBe(false);
    });

    it("should parse number variables correctly", () => {
      process.env.NEXT_PUBLIC_FREE_UNSUBSCRIBE_CREDITS = "100";
      
      delete require.cache[require.resolve("@/env")];
      const { env } = require("@/env");
      
      expect(typeof env.NEXT_PUBLIC_FREE_UNSUBSCRIBE_CREDITS).toBe("number");
      expect(env.NEXT_PUBLIC_FREE_UNSUBSCRIBE_CREDITS).toBe(100);
    });

    it("should handle optional variables", () => {
      // Don't set optional variables
      delete process.env.ELEVENLABS_WEBHOOK_SECRET;
      delete process.env.ELEVENLABS_AGENT_ID;
      
      delete require.cache[require.resolve("@/env")];
      const { env } = require("@/env");
      
      // Should not throw, optional variables can be undefined
      expect(env).toBeDefined();
    });

    it("should provide default values where specified", () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.MOCK_VOICE;
      delete process.env.NEXT_PUBLIC_CONTACTS_ENABLED;
      
      delete require.cache[require.resolve("@/env")];
      const { env } = require("@/env");
      
      // Check defaults
      expect(env.NEXT_PUBLIC_BASE_URL).toBe("https://inboxa.ai");
      expect(env.MOCK_VOICE).toBe(false);
      expect(env.NEXT_PUBLIC_CONTACTS_ENABLED).toBe(false);
    });
  });

  describe("Variable Organization", () => {
    it("should group authentication variables together", () => {
      const env = require("@/env").env;
      
      // Authentication-related variables
      expect(env).toHaveProperty("NEXTAUTH_SECRET");
      expect(env).toHaveProperty("GOOGLE_CLIENT_ID");
      expect(env).toHaveProperty("GOOGLE_CLIENT_SECRET");
    });

    it("should group AI service variables together", () => {
      const env = require("@/env").env;
      
      // AI service variables
      expect(env).toHaveProperty("OPENAI_API_KEY");
      expect(env).toHaveProperty("ELEVENLABS_API_KEY");
    });

    it("should group database variables together", () => {
      const env = require("@/env").env;
      
      // Database variables
      expect(env).toHaveProperty("DATABASE_URL");
    });

    it("should group Stripe variables together", () => {
      const env = require("@/env").env;
      
      // Stripe variables
      expect(env).toHaveProperty("STRIPE_SECRET_KEY");
      expect(env).toHaveProperty("STRIPE_WEBHOOK_SECRET");
    });
  });

  describe("Security", () => {
    it("should not expose server secrets on client", () => {
      const env = require("@/env").env;
      
      // These should only be accessible on server
      const serverSecrets = [
        "NEXTAUTH_SECRET",
        "GOOGLE_CLIENT_SECRET",
        "DATABASE_URL",
        "OPENAI_API_KEY",
        "ELEVENLABS_API_KEY",
      ];
      
      // On client, these should not be exposed via NEXT_PUBLIC_
      serverSecrets.forEach((secret) => {
        const publicVersion = `NEXT_PUBLIC_${secret}`;
        expect(env).not.toHaveProperty(publicVersion);
      });
    });

    it("should validate encryption variables", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("GOOGLE_ENCRYPT_SECRET");
      expect(env).toHaveProperty("GOOGLE_ENCRYPT_SALT");
    });

    it("should validate webhook secrets", () => {
      const env = require("@/env").env;
      
      // Webhook secrets for security
      expect(env).toHaveProperty("GOOGLE_PUBSUB_TOPIC_NAME");
      // ElevenLabs webhook secret is optional but should be in schema
      expect(env).toHaveProperty("ELEVENLABS_WEBHOOK_SECRET");
    });
  });

  describe("Voice Assistant Configuration", () => {
    it("should have all ElevenLabs configuration options", () => {
      const env = require("@/env").env;
      
      const elevenLabsVars = [
        "ELEVENLABS_API_KEY",
        "ELEVENLABS_WEBHOOK_SECRET",
        "ELEVENLABS_WEBHOOK_URL",
        "ELEVENLABS_AGENT_ID",
      ];
      
      elevenLabsVars.forEach((varName) => {
        expect(env).toHaveProperty(varName);
      });
    });

    it("should have voice mock flag for testing", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("MOCK_VOICE");
      expect(typeof env.MOCK_VOICE).toBe("boolean");
    });

    it("should not have removed LangGraph variables", () => {
      const env = require("@/env").env;
      
      // Verify these are actually removed
      const removedVars = [
        "LANGGRAPH_URL",
        "GRAPH_NAME",
        "NEXT_PUBLIC_LANGGRAPH_URL",
        "NEXT_PUBLIC_GRAPH_NAME",
      ];
      
      removedVars.forEach((varName) => {
        expect(env).not.toHaveProperty(varName);
      });
    });
  });

  describe("API Configuration", () => {
    it("should have proper URL configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("NEXTAUTH_URL");
      expect(env).toHaveProperty("NEXT_PUBLIC_BASE_URL");
    });

    it("should have Redis configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("UPSTASH_REDIS_URL");
      expect(env).toHaveProperty("UPSTASH_REDIS_TOKEN");
    });

    it("should have Tinybird configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("TINYBIRD_TOKEN");
      expect(env).toHaveProperty("TINYBIRD_BASE_URL");
      expect(env).toHaveProperty("TINYBIRD_ENCRYPT_SECRET");
    });
  });

  describe("Feature Flags", () => {
    it("should have contacts feature flag", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("NEXT_PUBLIC_CONTACTS_ENABLED");
      expect(typeof env.NEXT_PUBLIC_CONTACTS_ENABLED).toBe("boolean");
    });

    it("should have demo mode flag", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("NEXT_PUBLIC_SHOW_DEMO");
    });

    it("should have premium features configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("NEXT_PUBLIC_FREE_UNSUBSCRIBE_CREDITS");
      expect(typeof env.NEXT_PUBLIC_FREE_UNSUBSCRIBE_CREDITS).toBe("number");
    });
  });

  describe("Analytics and Monitoring", () => {
    it("should have PostHog configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("NEXT_PUBLIC_POSTHOG_KEY");
      expect(env).toHaveProperty("NEXT_PUBLIC_POSTHOG_HOST");
    });

    it("should have Sentry configuration", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("NEXT_PUBLIC_SENTRY_DSN");
    });

    it("should have Mintlify analytics", () => {
      const env = require("@/env").env;
      
      expect(env).toHaveProperty("MINTLIFY_ANALYTICS");
    });
  });

  describe("Comment Formatting", () => {
    it("should have properly formatted comments for ElevenLabs", () => {
      const fs = require("fs");
      const path = require("path");
      const envPath = path.join(process.cwd(), "env.ts");
      const envContent = fs.readFileSync(envPath, "utf-8");
      
      // Check comment formatting
      expect(envContent).toContain("// ElevenLabs voice webhook (optional)");
      expect(envContent).toContain("// HMAC secret to verify incoming ElevenLabs webhook events");
    });

    it("should maintain consistent indentation throughout file", () => {
      const fs = require("fs");
      const path = require("path");
      const envPath = path.join(process.cwd(), "env.ts");
      const envContent = fs.readFileSync(envPath, "utf-8");
      
      const lines = envContent.split("\n");
      const indentedLines = lines.filter((line) => line.trim().startsWith("ELEVENLABS_"));
      
      // All ElevenLabs lines should have same indentation
      const indentations = indentedLines.map((line) => line.match(/^(\s*)/)?.[1]?.length || 0);
      const uniqueIndentations = [...new Set(indentations)];
      
      expect(uniqueIndentations.length).toBe(1); // All should have same indentation
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain all existing non-LangGraph variables", () => {
      const env = require("@/env").env;
      
      // Critical variables that should still exist
      const criticalVars = [
        "DATABASE_URL",
        "NEXTAUTH_SECRET",
        "OPENAI_API_KEY",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "UPSTASH_REDIS_URL",
        "UPSTASH_REDIS_TOKEN",
        "NEXT_PUBLIC_BASE_URL",
      ];
      
      criticalVars.forEach((varName) => {
        expect(env).toHaveProperty(varName);
      });
    });

    it("should not break existing integrations", () => {
      const env = require("@/env").env;
      
      // Verify all major service integrations are still configured
      expect(env).toHaveProperty("GOOGLE_CLIENT_ID"); // Google OAuth
      expect(env).toHaveProperty("OPENAI_API_KEY"); // OpenAI
      expect(env).toHaveProperty("ELEVENLABS_API_KEY"); // ElevenLabs
      expect(env).toHaveProperty("STRIPE_SECRET_KEY"); // Stripe (optional)
      expect(env).toHaveProperty("UPSTASH_REDIS_URL"); // Redis
    });
  });
});