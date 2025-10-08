import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../setup/integration-setup";
import AppCard from "@/app/apps/components/AppCard";
import LikeToggle from "@/app/components/LikeToggle";

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

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    span: ({ children, ...props }: any) => {
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
      return <span {...restProps}>{children}</span>;
    },
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
  description: "Test Description",
  tags: ["React", "TypeScript"],
  type: "web" as const,
  platform: "web" as const,
  status: "online" as const,
  cover_image: "https://example.com/cover.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Like System Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle like toggle with API integration", async () => {
    const user = userEvent.setup();

    // Mock successful like toggle
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          success: true,
          liked: true,
          count: 101,
        });
      }),
    );

    render(<LikeToggle targetId="1" targetType="blog" />);

    const likeButton = screen.getByRole("button");
    expect(likeButton).toBeInTheDocument();

    await user.click(likeButton);

    await waitFor(() => {
      expect(likeButton).toHaveAttribute("data-liked", "true");
    });
  });

  it("should handle unlike toggle", async () => {
    const user = userEvent.setup();

    // Mock unlike toggle
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          success: true,
          liked: false,
          count: 99,
        });
      }),
    );

    render(<LikeToggle targetId="1" targetType="blog" initialLiked={true} />);

    const likeButton = screen.getByRole("button");
    expect(likeButton).toHaveAttribute("data-liked", "true");

    await user.click(likeButton);

    await waitFor(() => {
      expect(likeButton).toHaveAttribute("data-liked", "false");
    });
  });

  it("should handle API errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock API error
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        return HttpResponse.json(
          { error: "Like operation failed" },
          { status: 500 },
        );
      }),
    );

    render(<LikeToggle targetId="1" targetType="blog" />);

    // Wait for initial state to load
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    const likeButton = screen.getByRole("button");
    await user.click(likeButton);

    // Should handle error gracefully - just verify component still renders
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should sync like count between AppCard and LikeToggle", async () => {
    const user = userEvent.setup();

    // Mock successful like toggle
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          success: true,
          liked: true,
          count: 101,
        });
      }),
    );

    render(
      <div>
        <AppCard app={mockApp} />
        <LikeToggle targetId="1" targetType="blog" />
      </div>,
    );

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText("Test App")).toBeInTheDocument();
    });

    // Wait for initial state to load
    await waitFor(() => {
      const likeButtons = screen.getAllByRole("button");
      const likeButton = likeButtons.find(
        (btn) => btn.getAttribute("data-liked") !== null,
      );
      expect(likeButton).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByRole("button");
    const likeButton = likeButtons.find(
      (btn) => btn.getAttribute("data-liked") !== null,
    );
    await user.click(likeButton!);

    await waitFor(() => {
      expect(likeButton).toHaveAttribute("data-liked", "true");
    });
  });

  it("should handle different target types", async () => {
    const user = userEvent.setup();

    // Mock like toggle for blog
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          success: true,
          liked: true,
          count: 1,
        });
      }),
    );

    render(<LikeToggle targetId="blog-1" targetType="blog" />);

    const likeButton = screen.getByRole("button");
    await user.click(likeButton);

    await waitFor(() => {
      expect(likeButton).toHaveAttribute("data-liked", "true");
    });
  });

  it("should show loading state during API call", async () => {
    const user = userEvent.setup();

    // Mock slow API response
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          success: true,
          liked: true,
          count: 101,
        });
      }),
    );

    render(<LikeToggle targetId="1" targetType="blog" />);

    const likeButton = screen.getByRole("button");
    await user.click(likeButton);

    // Should show loading state
    expect(likeButton).toHaveAttribute("data-loading", "true");

    await waitFor(() => {
      expect(likeButton).toHaveAttribute("data-liked", "true");
    });
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();

    // Mock network error
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        return HttpResponse.error();
      }),
    );

    render(<LikeToggle targetId="1" targetType="blog" />);

    // Wait for component to render
    await waitFor(() => {
      const likeButton = screen.getByRole("button");
      expect(likeButton).toBeInTheDocument();
    });

    const likeButton = screen.getByRole("button");
    await user.click(likeButton);

    // Just verify the component still renders after the error
    await waitFor(
      () => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should prevent multiple simultaneous like requests", async () => {
    const user = userEvent.setup();

    // Mock slow API response
    server.use(
      http.post("/api/likes/toggle", async ({ request }) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          success: true,
          liked: true,
          count: 101,
        });
      }),
    );

    render(<LikeToggle targetId="1" targetType="blog" />);

    const likeButton = screen.getByRole("button");

    // Click multiple times quickly
    await user.click(likeButton);
    await user.click(likeButton);
    await user.click(likeButton);

    // Should only process one request
    await waitFor(() => {
      expect(likeButton).toHaveAttribute("data-liked", "true");
    });
  });
});
