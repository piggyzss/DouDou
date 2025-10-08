import { NextRequest, NextResponse } from "next/server";
import { AppModel, CreateAppData } from "@/lib/models/app";
import { uploadFile } from "@/lib/tencent-cos";

// 获取应用列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "online";
    const type = searchParams.get("type") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const result = await AppModel.findAll({
      page,
      limit,
      status,
      type,
      platform,
      tag,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "获取应用列表失败" }, { status: 500 });
  }
}

// 创建新应用
export async function POST(request: NextRequest) {
  try {
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
    const experienceUrl = formData.get("experience_url") as string;

    // 验证必填字段
    if (
      !name ||
      !description ||
      !type ||
      !platform ||
      !status ||
      !experienceMethod
    ) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    // 验证体验方式相关字段
    if (experienceMethod === "download" && !downloadUrl) {
      return NextResponse.json(
        { error: "下载方式需要提供下载链接" },
        { status: 400 },
      );
    }

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
        const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
        const uploadResult = await uploadFile(
          coverBuffer,
          coverImage.name,
          coverImage.type,
          "apps/covers/",
        );
        if (uploadResult.success && uploadResult.url) {
          coverImageUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "封面上传失败");
        }
      } catch (error) {
        return NextResponse.json({ error: "封面上传失败" }, { status: 500 });
      }
    }

    const video = formData.get("video") as File;
    if (video && video.size > 0) {
      try {
        const videoBuffer = Buffer.from(await video.arrayBuffer());
        const uploadResult = await uploadFile(
          videoBuffer,
          video.name,
          video.type,
          "apps/videos/",
        );
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "视频上传失败");
        }
      } catch (error) {
        return NextResponse.json({ error: "视频上传失败" }, { status: 500 });
      }
    }

    if (experienceMethod === "qrcode") {
      const qrCodeImage = formData.get("qr_code_image") as File;
      if (qrCodeImage && qrCodeImage.size > 0) {
        try {
          const qrBuffer = Buffer.from(await qrCodeImage.arrayBuffer());
          const uploadResult = await uploadFile(
            qrBuffer,
            qrCodeImage.name,
            qrCodeImage.type,
            "apps/qr-codes/",
          );
          if (uploadResult.success && uploadResult.url) {
            qrCodeUrl = uploadResult.url;
          } else {
            throw new Error(uploadResult.error || "二维码上传失败");
          }
        } catch (error) {
          return NextResponse.json(
            { error: "二维码上传失败" },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "二维码方式需要上传二维码图片" },
          { status: 400 },
        );
      }
    }

    // 创建应用数据
    const appData: CreateAppData = {
      name,
      description,
      tags,
      type,
      platform,
      status,
      experience_method: experienceMethod,
      download_url: downloadUrl || undefined,
      qr_code_url: qrCodeUrl || undefined,
      cover_image_url: coverImageUrl || undefined,
      video_url: videoUrl || undefined,
    };

    const app = await AppModel.create(appData);

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "创建应用失败" }, { status: 500 });
  }
}
