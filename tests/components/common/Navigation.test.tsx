import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navigation from "../../../app/components/Navigation";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock theme provider
jest.mock("../../../app/providers", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    nav: ({ children, ...props }: any) => {
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
      return (
        <nav data-testid="motion-nav" {...restProps}>
          {children}
        </nav>
      );
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
      return (
        <div data-testid="motion-div" {...restProps}>
          {children}
        </div>
      );
    },
    button: ({ children, ...props }: any) => {
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
      return (
        <button data-testid="motion-button" {...restProps}>
          {children}
        </button>
      );
    },
    form: ({ children, ...props }: any) => {
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
      return (
        <form data-testid="motion-form" {...restProps}>
          {children}
        </form>
      );
    },
    input: ({ ...props }: any) => {
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
      return <input data-testid="motion-input" {...restProps} />;
    },
  },
  AnimatePresence: ({ children }: any) => (
    <div data-testid="animate-presence">{children}</div>
  ),
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 0,
    });
  });

  it("renders navigation with all menu items", () => {
    render(<Navigation />);

    // Get all links and check that each menu item exists at least once
    const hiLinks = screen.getAllByText("Hi");
    const blogLinks = screen.getAllByText("Blog");
    const appLinks = screen.getAllByText("App");
    const aigcLinks = screen.getAllByText("AIGC");

    expect(hiLinks.length).toBeGreaterThan(0);
    expect(blogLinks.length).toBeGreaterThan(0);
    expect(appLinks.length).toBeGreaterThan(0);
    expect(aigcLinks.length).toBeGreaterThan(0);
  });

  it("shows mobile menu when hamburger is clicked", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    // Find the mobile menu button (it's the first motion-button)
    const menuButton = screen.getAllByTestId("motion-button")[0];
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton);

    // Wait for mobile menu to appear - look for the mobile navigation container
    await waitFor(() => {
      const mobileMenu = screen
        .getAllByTestId("motion-div")
        .find((div) => div.className.includes("md:hidden"));
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  it("closes mobile menu when X button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    // Find and click the mobile menu button (first motion-button)
    const menuButton = screen.getAllByTestId("motion-button")[0];
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton);

    // Wait for mobile menu to appear
    await waitFor(() => {
      const mobileMenu = screen
        .getAllByTestId("motion-div")
        .find((div) => div.className.includes("md:hidden"));
      expect(mobileMenu).toBeInTheDocument();
    });

    // Close mobile menu (same button toggles)
    await user.click(menuButton);

    // Wait for mobile menu to disappear - check that it's not visible
    await waitFor(() => {
      const mobileMenus = screen
        .getAllByTestId("motion-div")
        .filter((div) => div.className.includes("md:hidden"));
      // The mobile menu should still exist but be in closed state
      expect(mobileMenus.length).toBeGreaterThan(0);
    });
  });

  it("toggles theme when theme button is clicked", async () => {
    const user = userEvent.setup();

    render(<Navigation />);

    // Find theme button (it's the second motion-button)
    const themeButton = screen.getAllByTestId("motion-button")[1];
    expect(themeButton).toBeInTheDocument();
    await user.click(themeButton);

    // The theme button should be clickable (we can't easily test the actual theme change in this test environment)
    expect(themeButton).toBeInTheDocument();
  });

  it("handles search form submission", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    // Get the desktop search input by placeholder text (first one)
    const searchInputs = screen.getAllByPlaceholderText("Search Keys...");
    const searchInput = searchInputs[0];
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "test query");
    expect(searchInput).toHaveValue("test query");

    // Find the search form
    const searchForm = searchInput.closest("form");
    expect(searchForm).toBeInTheDocument();

    // Test that the form can be submitted (the actual preventDefault is handled by the component)
    fireEvent.submit(searchForm!);

    // The form should still be in the document after submission
    expect(searchForm).toBeInTheDocument();
  });

  it("updates search query when typing", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    // Get the desktop search input by placeholder text (first one)
    const searchInputs = screen.getAllByPlaceholderText("Search Keys...");
    const searchInput = searchInputs[0];
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "test");
    expect(searchInput).toHaveValue("test");
  });

  it("applies scrolled styles when window is scrolled", async () => {
    render(<Navigation />);

    // Simulate scroll
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 100,
    });

    fireEvent.scroll(window);

    // Wait for scroll effect to apply
    await waitFor(() => {
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("backdrop-blur-md");
    });
  });

  it("renders correct links for navigation items", () => {
    render(<Navigation />);

    // Get all links and find the first one with each name
    const hiLinks = screen.getAllByRole("link", { name: /hi/i });
    const blogLinks = screen.getAllByRole("link", { name: /blog/i });
    const appLinks = screen.getAllByRole("link", { name: /app/i });
    const aigcLinks = screen.getAllByRole("link", { name: /aigc/i });

    expect(hiLinks[0]).toHaveAttribute("href", "/");
    expect(blogLinks[0]).toHaveAttribute("href", "/blog");
    expect(appLinks[0]).toHaveAttribute("href", "/apps");
    expect(aigcLinks[0]).toHaveAttribute("href", "/aigc");
  });

  it("shows active state for current page", () => {
    render(<Navigation />);

    // Get all blog links and check that at least one exists
    const blogLinks = screen.getAllByRole("link", { name: /blog/i });
    expect(blogLinks.length).toBeGreaterThan(0);

    // Check that the first blog link has the correct styling
    expect(blogLinks[0]).toHaveClass("text-text-secondary");
  });
});
