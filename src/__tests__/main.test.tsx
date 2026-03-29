import { vi } from "vitest";

const createRoot = vi.fn(() => ({ render: vi.fn() }));

vi.mock("react-dom/client", () => ({
  default: { createRoot },
  createRoot,
}));

describe("main bootstrap", () => {
  it("mounts React app into the root element", async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';

    await import("../main");

    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
  });
});
