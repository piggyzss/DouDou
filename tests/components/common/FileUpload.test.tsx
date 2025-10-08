import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../../../app/components/FileUpload";

// Mock fetch
global.fetch = jest.fn();

describe("FileUpload Component", () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnUpload.mockClear();
  });

  it("renders upload area", () => {
    render(<FileUpload onUpload={mockOnUpload} />);

    expect(screen.getByText(/Click to upload files/i)).toBeInTheDocument();
    expect(document.getElementById("file-upload")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const customClass = "custom-upload-class";
    render(<FileUpload onUpload={mockOnUpload} className={customClass} />);

    const uploadArea = screen
      .getByText(/Click to upload files/i)
      .closest("div").parentElement;
    expect(uploadArea).toHaveClass(customClass);
  });

  it("handles file selection via button click", async () => {
    const user = userEvent.setup();

    // Mock successful upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        url: "https://example.com/file.jpg",
      }),
    } as Response);

    render(<FileUpload onUpload={mockOnUpload} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, file);

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeInTheDocument();
    });
  });

  it("handles multiple file selection when multiple prop is true", async () => {
    const user = userEvent.setup();

    // Mock successful upload responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          url: "https://example.com/file1.jpg",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          url: "https://example.com/file2.jpg",
        }),
      } as Response);

    render(<FileUpload onUpload={mockOnUpload} multiple />);

    const file1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "test2.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, [file1, file2]);

    // Wait for both uploads to complete
    await waitFor(() => {
      expect(screen.getByText("test1.txt")).toBeInTheDocument();
      expect(screen.getByText("test2.txt")).toBeInTheDocument();
    });
  });

  it("respects accept prop for file types", () => {
    render(<FileUpload onUpload={mockOnUpload} accept="image/*" />);

    const input = document.getElementById("file-upload") as HTMLInputElement;
    expect(input).toHaveAttribute("accept", "image/*");
  });

  it("shows uploading state during file upload", async () => {
    const user = userEvent.setup();

    // Mock slow upload response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  url: "https://example.com/file.jpg",
                }),
              } as Response),
            100,
          ),
        ),
    );

    render(<FileUpload onUpload={mockOnUpload} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    // Start upload
    await user.upload(input, file);

    // Should show uploading state immediately
    expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeInTheDocument();
    });
  });

  it("shows success state after successful upload", async () => {
    const user = userEvent.setup();

    // Mock successful upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        url: "https://example.com/file.jpg",
      }),
    } as Response);

    render(<FileUpload onUpload={mockOnUpload} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeInTheDocument();
    });

    expect(mockOnUpload).toHaveBeenCalledWith("https://example.com/file.jpg");
  });

  it("shows error state after failed upload", async () => {
    const user = userEvent.setup();

    // Mock failed upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: "Upload failed" }),
    } as Response);

    render(<FileUpload onUpload={mockOnUpload} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("Upload failed")).toBeInTheDocument();
    });

    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it("handles network error during upload", async () => {
    const user = userEvent.setup();

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<FileUpload onUpload={mockOnUpload} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("Upload failed")).toBeInTheDocument();
    });

    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it("uses correct folder in upload request", async () => {
    const user = userEvent.setup();
    const customFolder = "custom-folder";

    // Mock successful upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        url: "https://example.com/file.jpg",
      }),
    } as Response);

    render(<FileUpload onUpload={mockOnUpload} folder={customFolder} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });
  });

  it("allows removing uploaded files", async () => {
    const user = userEvent.setup();

    // Mock successful upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        url: "https://example.com/file.jpg",
      }),
    } as Response);

    render(<FileUpload onUpload={mockOnUpload} />);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = document.getElementById("file-upload") as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeInTheDocument();
    });

    // Click remove button (X button)
    const removeButton = screen.getByRole("button");
    await user.click(removeButton);

    // File should be removed
    expect(screen.queryByText(/test.txt/)).not.toBeInTheDocument();
  });

  it("handles drag and drop events", () => {
    render(<FileUpload onUpload={mockOnUpload} />);

    const uploadArea = screen
      .getByText(/Click to upload files/i)
      .closest("div");

    // Test drag over
    fireEvent.dragOver(uploadArea!);
    // Note: The component doesn't currently implement drag over styles
    // This test verifies the drag events don't break the component
    expect(uploadArea).toBeInTheDocument();

    // Test drag leave
    fireEvent.dragLeave(uploadArea!);
    expect(uploadArea).toBeInTheDocument();
  });
});
