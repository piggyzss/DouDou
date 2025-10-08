import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import MusicPlayer from "../../../app/aigc/components/MusicPlayer";

describe("MusicPlayer Component", () => {
  const mockOnCurrentTrackIdChange = jest.fn();
  const mockProps = {
    currentTrackId: null,
    onCurrentTrackIdChange: mockOnCurrentTrackIdChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders audio element with correct attributes", () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const audio = container.querySelector("audio");

    expect(audio).toBeInTheDocument();
    expect(audio).toHaveClass("hidden");
    expect(audio).toHaveAttribute("preload", "auto");
    expect(audio).toHaveAttribute("playsInline");
  });

  it("handles play event", async () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();

    // Mock audio play method
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(audio!, "play", {
      value: mockPlay,
      writable: true,
    });

    // Dispatch custom event
    const event = new CustomEvent("music:play", {
      detail: { url: "https://example.com/audio.mp3", id: "123" },
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockOnCurrentTrackIdChange).toHaveBeenCalledWith("123");
      expect(mockPlay).toHaveBeenCalled();
      expect(audio).toHaveAttribute("src", "https://example.com/audio.mp3");
    });
  });

  it("handles stop event", async () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();

    // Mock audio pause method
    const mockPause = jest.fn();
    Object.defineProperty(audio!, "pause", {
      value: mockPause,
      writable: true,
    });

    // Dispatch custom event with null values
    const event = new CustomEvent("music:play", {
      detail: { url: null, id: null },
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockOnCurrentTrackIdChange).toHaveBeenCalledWith(null);
      expect(mockPause).toHaveBeenCalled();
    });
  });

  it("updates isPlaying state on audio play/pause", async () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();

    // Mock dispatchEvent to track calls
    const mockDispatchEvent = jest.fn();
    Object.defineProperty(audio!, "dispatchEvent", {
      value: mockDispatchEvent,
      writable: true,
    });

    // Simulate play event
    fireEvent.play(audio!);
    await waitFor(() => {
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    });

    // Simulate pause event
    fireEvent.pause(audio!);
    await waitFor(() => {
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    });
  });

  it("cleans up event listeners on unmount", () => {
    const { unmount } = render(<MusicPlayer {...mockProps} />);
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "music:play",
      expect.any(Function),
    );
  });
});
