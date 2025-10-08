import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../../../app/components/Footer";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    footer: ({ children, ...props }: any) => {
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
      return <footer {...restProps}>{children}</footer>;
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
    a: ({ children, ...props }: any) => {
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
      return <a {...restProps}>{children}</a>;
    },
  },
}));

describe("Footer Component", () => {
  it("renders footer with personal information", () => {
    render(<Footer />);

    expect(screen.getByText("<shanshan />")).toBeInTheDocument();
    expect(
      screen.getByText("前端开发者 | AI爱好者 | 创意工作者"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("用代码创造美好，用AI探索未来，让创意与技术完美融合"),
    ).toBeInTheDocument();
  });

  it("renders current year in copyright", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} shanshan. 保留所有权利.`),
    ).toBeInTheDocument();
  });

  it("renders all social media links", () => {
    render(<Footer />);

    // Check for social media links by href
    const allLinks = screen.getAllByRole("link");
    const socialLinks = allLinks.filter(
      (link) =>
        link.getAttribute("href")?.includes("github.com") ||
        link.getAttribute("href")?.includes("twitter.com") ||
        link.getAttribute("href")?.includes("linkedin.com") ||
        link.getAttribute("href")?.includes("mailto:"),
    );

    expect(socialLinks).toHaveLength(4);
  });

  it("has correct href attributes for social links", () => {
    render(<Footer />);

    const allLinks = screen.getAllByRole("link");
    const githubLink = allLinks.find((link) =>
      link.getAttribute("href")?.includes("github.com"),
    );
    const twitterLink = allLinks.find((link) =>
      link.getAttribute("href")?.includes("twitter.com"),
    );
    const linkedinLink = allLinks.find((link) =>
      link.getAttribute("href")?.includes("linkedin.com"),
    );
    const emailLink = allLinks.find((link) =>
      link.getAttribute("href")?.includes("mailto:"),
    );

    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/yourusername",
    );
    expect(twitterLink).toHaveAttribute(
      "href",
      "https://twitter.com/yourusername",
    );
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://linkedin.com/in/yourusername",
    );
    expect(emailLink).toHaveAttribute("href", "mailto:your.email@example.com");
  });

  it("renders navigation links", () => {
    render(<Footer />);

    expect(screen.getByText("博客文章")).toBeInTheDocument();
    expect(screen.getByText("开发作品")).toBeInTheDocument();
    expect(screen.getByText("AIGC作品")).toBeInTheDocument();
  });

  it("has correct href attributes for navigation links", () => {
    render(<Footer />);

    const blogLink = screen.getByRole("link", { name: /博客文章/i });
    const appLink = screen.getByRole("link", { name: /开发作品/i });
    const aigcLink = screen.getByRole("link", { name: /AIGC作品/i });

    expect(blogLink).toHaveAttribute("href", "/blog");
    expect(appLink).toHaveAttribute("href", "/apps");
    expect(aigcLink).toHaveAttribute("href", "/aigc");
  });

  it("renders contact information section", () => {
    render(<Footer />);

    expect(screen.getByText("关注我")).toBeInTheDocument();
    // Check for email link
    const emailLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href")?.includes("mailto:"));
    expect(emailLink).toBeInTheDocument();
  });

  it("renders with proper footer structure", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("bg-bg-secondary", "dark:bg-gray-900");
  });

  it("has proper grid layout classes", () => {
    render(<Footer />);

    // Find the grid container by looking for the div with grid classes
    const gridContainer = screen.getByText("<shanshan />").closest("div")
      ?.parentElement?.parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-3",
      "gap-8",
    );
  });
});
