import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogFrontmatter = {
  title: string;
  date: string;
  tags: string[];
  excerpt?: string;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function ensureBlogDirExists() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

export function getAllSlugs(): string[] {
  ensureBlogDirExists();
  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/i, ""));
}

export function readPostFile(
  slug: string,
): { frontmatter: BlogFrontmatter; content: string } | null {
  ensureBlogDirExists();
  const filePathMd = path.join(BLOG_DIR, `${slug}.md`);
  const filePathMdx = path.join(BLOG_DIR, `${slug}.mdx`);
  const filePath = fs.existsSync(filePathMd)
    ? filePathMd
    : fs.existsSync(filePathMdx)
      ? filePathMdx
      : null;
  if (!filePath) return null;
  const file = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(file);
  const fm = normalizeFrontmatter(data);
  return { frontmatter: fm, content };
}

function normalizeFrontmatter(data: any): BlogFrontmatter {
  const title = typeof data.title === "string" ? data.title : "未命名";
  const date =
    typeof data.date === "string" ? data.date : new Date().toISOString();
  const tags: string[] = Array.isArray(data.tags)
    ? data.tags.map((t: any) => String(t))
    : typeof data.tags === "string" && data.tags.trim().length > 0
      ? data.tags.split(",").map((t: string) => t.trim())
      : [];
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : undefined;
  return { title, date, tags, excerpt };
}

export function getPostBySlug(
  slug: string,
): (BlogPostMeta & { content: string }) | null {
  const res = readPostFile(slug);
  if (!res) return null;
  return { slug, ...res.frontmatter, content: res.content };
}

export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllSlugs();
  const posts = slugs
    .map((slug) => {
      const res = readPostFile(slug);
      if (!res) return null;
      const fm = res.frontmatter;
      return {
        slug,
        title: fm.title,
        date: fm.date,
        tags: fm.tags,
        excerpt: fm.excerpt ?? generateExcerpt(res.content, 120),
      } as BlogPostMeta;
    })
    .filter(Boolean) as BlogPostMeta[];
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

export function paginatePosts(
  posts: BlogPostMeta[],
  page: number,
  perPage: number,
) {
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  return {
    total,
    totalPages,
    currentPage,
    items: posts.slice(start, end),
  };
}

export function saveNewPost(params: {
  title: string;
  slug: string;
  tags: string[];
  content: string;
  date?: string;
}) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("只允许在开发模式下创建博客");
  }
  ensureBlogDirExists();
  const slug = sanitizeSlug(params.slug || slugify(params.title));
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    throw new Error("slug 已存在");
  }
  const frontmatter: BlogFrontmatter = {
    title: params.title,
    date: params.date ?? new Date().toISOString(),
    tags: params.tags,
  };
  const content = matter.stringify(params.content, frontmatter);
  fs.writeFileSync(filePath, content, "utf8");
  return { slug };
}

export function updateExistingPost(params: {
  slug: string;
  title: string;
  tags: string[];
  content: string;
  date?: string;
}) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("只允许在开发模式下编辑博客");
  }
  ensureBlogDirExists();
  const slug = sanitizeSlug(params.slug);
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const existing = fs.existsSync(filePath);
  const frontmatter: BlogFrontmatter = {
    title: params.title,
    date:
      params.date ??
      (existing
        ? normalizeFrontmatter(matter.read(filePath).data).date
        : new Date().toISOString()),
    tags: params.tags,
  };
  const content = matter.stringify(params.content, frontmatter);
  fs.writeFileSync(filePath, content, "utf8");
  return { slug };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function sanitizeSlug(slug: string): string {
  return slug
    .replace(/\/+|\\+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function generateExcerpt(md: string, length: number): string {
  const text = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\!\[[^\]]*\]\([^\)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, "")
    .replace(/[#>*_\-`~]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
