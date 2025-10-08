import { NextRequest, NextResponse } from "next/server";
import { BlogModel } from "@/lib/models/blog";
import { uploadFile } from "@/lib/tencent-cos";

// 生成slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .normalize("NFC");
}

// 生成摘要
function generateExcerpt(content: string, maxLength: number = 150): string {
  const plainText = content
    .replace(/[#$*`]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await BlogModel.findAllPublished(page, limit);

    // 获取每篇文章的标签
    const postsWithTags = await Promise.all(
      result.posts.map(async (post) => {
        const tags = await BlogModel.getPostTags(post.id);
        return {
          ...post,
          tags: tags.map((tag) => tag.name),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        posts: postsWithTags,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "获取博客列表失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "只允许在开发模式下创建博客" },
        { status: 403 },
      );
    }

    const {
      title,
      slug: providedSlug,
      tags,
      content,
      cover_url,
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 },
      );
    }

    // 生成或验证slug（做Unicode规范化）
    const slug = (
      providedSlug && String(providedSlug).trim().length > 0
        ? String(providedSlug)
        : generateSlug(title)
    ).normalize("NFC");

    // 检查slug是否已存在
    const existingPost = await BlogModel.findBySlug(slug);
    if (existingPost) {
      return NextResponse.json({ error: "该slug已存在" }, { status: 400 });
    }

    // 生成摘要
    const excerpt = generateExcerpt(content);

    // 创建博客文章
    const post = await BlogModel.create({
      title,
      slug,
      content,
      excerpt,
      status: "published",
      cover_url,
    } as any);

    // 处理标签
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName);

        // 查找或创建标签
        let tag = await BlogModel.findTagBySlug(tagSlug);
        if (!tag) {
          tag = await BlogModel.createTag({
            name: tagName,
            slug: tagSlug,
            description: `标签: ${tagName}`,
          });
        }

        // 关联标签和文章
        await BlogModel.addTagToPost(post.id, tag.id);
      }
    }

    // 将内容上传到腾讯云COS（可选）
    try {
      const contentBuffer = Buffer.from(content, "utf-8");
      const uploadResult = await uploadFile(
        contentBuffer,
        `blog-${post.id}-${slug}.md`,
        "text/markdown",
        "blog/content",
      );

      if (uploadResult.success) {
      } else {
      }
    } catch (cosError) {
      // 即使COS上传失败，也不影响博客创建
    }

    return NextResponse.json({
      success: true,
      message: "博客创建成功",
      post: {
        ...post,
        cover_url: post.cover_url || cover_url || null,
        tags: tags || [],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "创建博客失败" }, { status: 500 });
  }
}
