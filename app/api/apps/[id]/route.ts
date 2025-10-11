import { NextRequest, NextResponse } from "next/server";
import { AppModel, UpdateAppData } from "@/lib/models/app";
import { uploadFile } from "@/lib/tencent-cos";

// 获取单个应用
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的应用ID" }, { status: 400 });
    }

    const app = await AppModel.findById(id);
    if (!app) {
      return NextResponse.json({ error: "应用不存在" }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: "获取应用失败" }, { status: 500 });
  }
}

// 更新应用
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的应用ID" }, { status: 400 });
    }

    const formData = await request.formData();

    // 获取基本字段
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const tagsString = formData.get("tags") as string;
    const type = formData.get("type") as "app" | "miniprogram" | "game";
    const platform = formData.get("platform") as "web" | "mobile" | "wechat";
    const status = formData.get("status") as "development" | "beta" | "online";
    const experienceMethod = formData.get("experience_method") as
      | "download"
      | "qrcode";
    const downloadUrl = formData.get("download_url") as string;
    const githubUrl = formData.get("github_url") as string;

    // 处理标签
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    if (tags.length > 5) {
      return NextResponse.json(
        { error: "标签数量不能超过5个" },
        { status: 400 },
      );
    }

    // 处理文件上传
    let coverImageUrl = "";
    let videoUrl = "";
    let qrCodeUrl = "";

    const coverImage = formData.get("cover_image") as File;
    if (coverImage && coverImage.size > 0) {
      try {
        const uploadResult = await uploadFile(
          Buffer.from(await coverImage.arrayBuffer()),
          coverImage.name,
          coverImage.type,
          "apps/covers",
        );
        if (uploadResult.success && uploadResult.url) {
          coverImageUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "上传失败");
        }
      } catch (error) {
        return NextResponse.json({ error: "封面上传失败" }, { status: 500 });
      }
    }

    const video = formData.get("video") as File;
    if (video && video.size > 0) {
      try {
        const uploadResult = await uploadFile(
          Buffer.from(await video.arrayBuffer()),
          video.name,
          video.type,
          "apps/videos",
        );
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "上传失败");
        }
      } catch (error) {
        return NextResponse.json({ error: "视频上传失败" }, { status: 500 });
      }
    }

    if (experienceMethod === "qrcode") {
      const qrCodeImage = formData.get("qr_code_image") as File;
      if (qrCodeImage && qrCodeImage.size > 0) {
        try {
          const uploadResult = await uploadFile(
            Buffer.from(await qrCodeImage.arrayBuffer()),
            qrCodeImage.name,
            qrCodeImage.type,
            "apps/qr-codes",
          );
          if (uploadResult.success && uploadResult.url) {
            qrCodeUrl = uploadResult.url;
          } else {
            throw new Error(uploadResult.error || "上传失败");
          }
        } catch (error) {
          return NextResponse.json(
            { error: "二维码上传失败" },
            { status: 500 },
          );
        }
      }
    }

    // 构建更新数据
    const updateData: UpdateAppData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (tags.length > 0) updateData.tags = tags;
    if (type) updateData.type = type;
    if (platform) updateData.platform = platform;
    if (status) updateData.status = status;
    if (experienceMethod) updateData.experience_method = experienceMethod;
    if (downloadUrl) updateData.download_url = downloadUrl;
    if (githubUrl) updateData.github_url = githubUrl;
    if (coverImageUrl) updateData.cover_image_url = coverImageUrl;
    if (videoUrl) updateData.video_url = videoUrl;
    if (qrCodeUrl) updateData.qr_code_url = qrCodeUrl;

    const app = await AppModel.update(id, updateData);
    if (!app) {
      return NextResponse.json({ error: "应用不存在" }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: "更新应用失败" }, { status: 500 });
  }
}

// 删除应用
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的应用ID" }, { status: 400 });
    }

    const success = await AppModel.delete(id);
    if (!success) {
      return NextResponse.json({ error: "应用不存在" }, { status: 404 });
    }

    return NextResponse.json({ message: "应用删除成功" });
  } catch (error) {
    return NextResponse.json({ error: "删除应用失败" }, { status: 500 });
  }
}
