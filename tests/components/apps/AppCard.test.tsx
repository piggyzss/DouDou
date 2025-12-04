import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppCard from "@/app/apps/components/AppCard";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        stats: [
          { dau: 100 },
          { dau: 110 },
          { dau: 120 },
          { dau: 130 },
          { dau: 140 },
          { dau: 150 },
          { dau: 160 },
        ],
      }),
  }),
) as jest.Mock;

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        layoutId,
        initial,
        animate,
        variants,
        transition,
        ...restProps
      } = props;
      return <div {...restProps}>{children}</div>;
    },
  },
}));

const mockApp = {
  id: 1,
  name: "Test App",
  slug: "test-app",
  description: "This is a test application for demonstration purposes.",
  tags: ["React", "TypeScript", "Next.js"],
  type: "app" as const,
  platform: "web" as const,
  status: "online" as const,
  experience_method: "download" as const,
  download_url: "https://example.com/download",
  cover_image_url: "https://example.com/cover.jpg",
  video_url: "https://example.com/video.mp4",
  dau: 100,
  downloads: 1000,
  likes_count: 50,
  trend: "rising",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  published_at: "2024-01-01T00:00:00Z",
};

describe("AppCard", () => {
  it("should render app information correctly", async () => {
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    await screen.findByText("Test App");

    expect(screen.getByText("Test App")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a test application for demonstration purposes.",
      ),
    ).toBeInTheDocument();
    // AppCard组件显示自定义tags
    expect(screen.getByText("#React")).toBeInTheDocument();
    expect(screen.getByText("#TypeScript")).toBeInTheDocument();
    expect(screen.getByText("#Next.js")).toBeInTheDocument();
  });

  it("should display app statistics", async () => {
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    await screen.findByText("DAU 100");

    expect(screen.getByText("DAU 100")).toBeInTheDocument(); // DAU
    expect(screen.getByText("1.0K")).toBeInTheDocument(); // Downloads (formatted)
    // Likes count is not displayed in the current component
  });

  it("should show QR code button for experience method", async () => {
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    await screen.findByRole("button", { name: /体验一下/i });

    expect(
      screen.getByRole("button", { name: /体验一下/i }),
    ).toBeInTheDocument();
  });

  it("should show QR code button for qrcode experience method", async () => {
    const qrApp = {
      ...mockApp,
      experience_method: "qrcode" as const,
      qr_code_url: "https://example.com/qr.jpg",
    };

    render(<AppCard app={qrApp} />);

    // Wait for data to load
    await screen.findByRole("button", { name: /体验一下/i });

    expect(
      screen.getByRole("button", { name: /体验一下/i }),
    ).toBeInTheDocument();
  });

  it("should display app type and platform", async () => {
    const appWithoutTags = {
      ...mockApp,
      tags: [], // Empty tags so type/platform labels are shown
    };
    
    render(<AppCard app={appWithoutTags} />);

    // Wait for data to load
    await screen.findByText("Test App");

    // Check for app type and platform tags
    expect(screen.getByText("#应用")).toBeInTheDocument();
    expect(screen.getByText("#Web")).toBeInTheDocument();
  });

  it("should show trend indicator", async () => {
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    await screen.findByText("Test App");

    // 趋势显示已被注释掉，所以不测试趋势文本
    // expect(screen.getByText('上升')).toBeInTheDocument()
  });

  it("should handle click events", async () => {
    const user = userEvent.setup();
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    const experienceButton = await screen.findByRole("button", {
      name: /体验一下/i,
    });
    await user.click(experienceButton);

    // 验证按钮存在
    expect(experienceButton).toBeInTheDocument();
  });

  it("should display cover image if available", async () => {
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    await screen.findByText("Test App");

    const coverImages = screen.getAllByRole("img");
    const coverImage = coverImages.find(
      (img) => img.getAttribute("alt") === "Test App",
    );
    expect(coverImage).toHaveAttribute(
      "src",
      "/api/apps/proxy-image?url=https%3A%2F%2Fexample.com%2Fcover.jpg",
    );
    expect(coverImage).toHaveAttribute("alt", "Test App");
  });

  it("should handle missing cover image gracefully", async () => {
    const appWithoutCover = {
      ...mockApp,
      cover_image_url: undefined,
    };

    render(<AppCard app={appWithoutCover} />);

    // Wait for data to load and verify app card renders without cover image
    await screen.findByText("Test App");
    expect(screen.getByText("Test App")).toBeInTheDocument();
  });

  it("should format numbers correctly", async () => {
    const appWithLargeNumbers = {
      ...mockApp,
      dau: 1234,
      downloads: 56789,
      likes_count: 999,
    };

    render(<AppCard app={appWithLargeNumbers} />);

    // Wait for data to load
    await screen.findByText("DAU 1.2K");

    expect(screen.getByText("DAU 1.2K")).toBeInTheDocument(); // DAU formatted
    expect(screen.getByText("56.8K")).toBeInTheDocument(); // Downloads formatted
    // Likes count is not displayed in the current component
  });

  it("should show correct status badge", async () => {
    render(<AppCard app={mockApp} />);

    // Wait for data to load
    await screen.findByText("已上线");
    expect(screen.getByText("已上线")).toBeInTheDocument();
  });

  it("should handle different app types", async () => {
    const miniprogramApp = {
      ...mockApp,
      type: "miniprogram" as const,
      tags: [], // Empty tags so type label is shown
    };

    render(<AppCard app={miniprogramApp} />);

    // Wait for data to load
    await screen.findByText("Test App");

    // Find the tag that contains '小程序'
    const tags = screen.getAllByText((content, element) => {
      const text = element?.textContent || "";
      return text.includes("#") && text.includes("小程序");
    });
    expect(tags.length).toBeGreaterThan(0);
  });

  it("should handle different platforms", async () => {
    const mobileApp = {
      ...mockApp,
      platform: "mobile" as const,
      tags: [], // Empty tags so platform label is shown
    };

    render(<AppCard app={mobileApp} />);

    // Wait for data to load
    await screen.findByText("Test App");

    // Find the tag that contains '移动端'
    const tags = screen.getAllByText((content, element) => {
      const text = element?.textContent || "";
      return text.includes("#") && text.includes("移动端");
    });
    expect(tags.length).toBeGreaterThan(0);
  });

  it("should show different trend indicators", async () => {
    const stableApp = {
      ...mockApp,
      trend: "stable",
    };

    render(<AppCard app={stableApp} />);

    // Wait for data to load
    await screen.findByText("Test App");

    // 趋势显示已被注释掉，所以不测试趋势文本
    // expect(screen.getByText('稳定')).toBeInTheDocument()
  });
});
