import { describe, it, expect } from "vitest";
import { isAllowedImageUrl } from "../llm";

describe("llm — image URL allowlist (UT-03 surrogate)", () => {
  it("UT-03: rejects URLs outside the Telegram + Supabase Storage allowlist", () => {
    expect(isAllowedImageUrl("https://evil.example.com/x.jpg")).toBe(false);
    expect(isAllowedImageUrl("http://api.telegram.org/file/x.jpg")).toBe(false);
    expect(isAllowedImageUrl("not-a-url")).toBe(false);
    expect(
      isAllowedImageUrl(
        "https://abc.supabase.co/storage/v1/object/private/owner-photos/x.jpg",
      ),
    ).toBe(false);
  });

  it("UT-04: accepts Telegram CDN and Supabase public-Storage URLs", () => {
    expect(
      isAllowedImageUrl("https://api.telegram.org/file/bot123/photos/x.jpg"),
    ).toBe(true);
    expect(
      isAllowedImageUrl(
        "https://abc.supabase.co/storage/v1/object/public/owner-photos/x.jpg",
      ),
    ).toBe(true);
    expect(
      isAllowedImageUrl(
        "https://xyz.supabase.in/storage/v1/object/public/consult-photos/y.png",
      ),
    ).toBe(true);
  });
});
