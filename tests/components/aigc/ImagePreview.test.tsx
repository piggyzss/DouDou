import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImagePreview from "../../../app/aigc/components/ImagePreview";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("ImagePreview Component", () => {
  const mockProps = {
    isOpen: true,
    imageUrl: "https://example.com/image.jpg",
    hasPrev: true,
    hasNext: true,
    onClose: jest.fn(),
    onPrev: jest.fn(),
    onNext: jest.fn(),
    currentIndex: 1,
    total: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders image preview when open", () => {
    render(<ImagePreview {...mockProps} />);

    expect(screen.getByAltText("预览图片")).toBeInTheDocument();
    expect(screen.getByAltText("预览图片")).toHaveAttribute(
      "src",
      mockProps.imageUrl,
    );
  });

  it("does not render when closed", () => {
    render(<ImagePreview {...mockProps} isOpen={false} />);

    expect(screen.queryByAltText("预览图片")).not.toBeInTheDocument();
  });

  it("shows navigation buttons when available", () => {
    render(<ImagePreview {...mockProps} />);

    expect(screen.getByTitle("上一张")).toBeInTheDocument();
    expect(screen.getByTitle("下一张")).toBeInTheDocument();
  });

  it("hides navigation buttons when not available", () => {
    render(<ImagePreview {...mockProps} hasPrev={false} hasNext={false} />);

    expect(screen.queryByTitle("上一张")).not.toBeInTheDocument();
    expect(screen.queryByTitle("下一张")).not.toBeInTheDocument();
  });

  it("shows image counter when provided", () => {
    render(<ImagePreview {...mockProps} />);

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("hides image counter when not provided", () => {
    render(
      <ImagePreview
        {...mockProps}
        currentIndex={undefined}
        total={undefined}
      />,
    );

    expect(screen.queryByText("2 / 3")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImagePreview {...mockProps} />);

    const closeButton = screen.getByTitle("关闭预览");
    await user.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onPrev when previous button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImagePreview {...mockProps} />);

    const prevButton = screen.getByTitle("上一张");
    await user.click(prevButton);

    expect(mockProps.onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImagePreview {...mockProps} />);

    const nextButton = screen.getByTitle("下一张");
    await user.click(nextButton);

    expect(mockProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("renders with correct accessibility attributes", () => {
    render(<ImagePreview {...mockProps} />);

    expect(screen.getByTitle("关闭预览")).toBeInTheDocument();
    expect(screen.getByTitle("上一张")).toBeInTheDocument();
    expect(screen.getByTitle("下一张")).toBeInTheDocument();
  });
});
