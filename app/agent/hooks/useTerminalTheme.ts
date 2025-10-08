"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";

export function useTerminalTheme() {
  const { theme } = useTheme();
  const [terminalTheme, setTerminalTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 根据整站主题自动切换终端主题
    if (theme === "dark") {
      setTerminalTheme("dark");
      document.documentElement.setAttribute("data-terminal-theme", "dark");
    } else {
      setTerminalTheme("light");
      document.documentElement.setAttribute("data-terminal-theme", "light");
    }
  }, [theme]);

  return terminalTheme;
}
