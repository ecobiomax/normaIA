import { describe, it, expect } from "vitest";

describe("Environment Secrets Validation", () => {
  it("should have Supabase credentials configured", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\//);
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });

  it("should have OpenAI API key configured", () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.OPENAI_API_KEY).toMatch(/^sk-proj-/);
  });

  it("should have Qdrant credentials configured", () => {
    expect(process.env.QDRANT_URL).toBeDefined();
    expect(process.env.QDRANT_URL).toMatch(/^https:\/\//);
    expect(process.env.QDRANT_API_KEY).toBeDefined();
  });

  it("should have AbacatePay API key configured", () => {
    expect(process.env.ABACATEPAY_API_KEY).toBeDefined();
    expect(process.env.ABACATEPAY_API_KEY).toMatch(/^abc_/);
  });

  it("should validate Supabase URL format", () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(url).toContain("supabase.co");
  });

  it("should validate Qdrant URL format", () => {
    const url = process.env.QDRANT_URL;
    expect(url).toContain("qdrant.io");
  });
});
