"use client";

import { useEffect, useMemo, useState } from "react";

function extractHeadings(markdown: string) {
  const lines = markdown.split(/\n+/);
  const headings = [] as { level: number; text: string; id: string }[];
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[#`*_~]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ level, text, id });
    }
  }
  return headings;
}

export default function TOC() {
  const [headings, setHeadings] = useState<
    { level: number; text: string; id: string }[]
  >([]);
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        "article h1, article h2, article h3, article h4, article h5, article h6",
      ),
    ) as HTMLElement[];
    const hs = nodes.map((el) => {
      const level = Number(el.tagName.substring(1));
      const text = el.textContent || "";
      const id =
        el.id ||
        text
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
          .replace(/\s+/g, "-");
      return { level, text, id };
    });
    setHeadings(hs);
  }, []);

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = h.id;
        }
      }
      setActiveId(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler as any);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm font-blog">
      <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
        <div className="font-medium text-text-primary mb-3 text-base">目录</div>
        <ul className="space-y-2">
          {headings.map((h) => (
            <li
              key={h.id}
              className={`truncate ${activeId === h.id ? "text-primary font-medium" : "text-text-secondary"}`}
            >
              <a
                className="hover:text-primary transition-colors duration-200 block"
                href={`#${h.id}`}
                style={{ paddingLeft: (h.level - 1) * 8 }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
