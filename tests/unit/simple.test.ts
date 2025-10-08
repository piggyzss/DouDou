// Simple test to verify Jest configuration
describe("Jest Configuration Test", () => {
  it("should run basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });

  it("should work with environment variables", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});
