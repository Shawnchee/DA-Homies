import { describe, it, expect } from "vitest";
import { billablesFor, BILLING_MATRIX } from "../billing-matrix";

describe("billing-matrix", () => {
  it("UT-01: matches a known drug line against the gastroenteritis matrix", () => {
    const items = billablesFor("Acute gastroenteritis with mild dehydration");
    expect(items.length).toBeGreaterThan(0);

    const cerenia = items.find((i) =>
      i.item.toLowerCase().includes("cerenia"),
    );
    expect(cerenia).toBeDefined();
    expect(cerenia).toMatchObject({
      item: "Antiemetic injection (Cerenia)",
      price: 35,
    });

    const fluids = items.find((i) =>
      i.item.toLowerCase().includes("hartmann"),
    );
    expect(fluids?.price).toBe(45);
  });

  it("UT-02: returns empty matrix for an unknown / unverified diagnosis", () => {
    const unverified = billablesFor("Zylophexin-induced syndrome");
    expect(unverified).toEqual([]);

    const known = BILLING_MATRIX["atopic dermatitis"];
    expect(known).toBeDefined();
    expect(known.find((i) => i.item.includes("Apoquel"))?.price).toBe(180);
  });
});
