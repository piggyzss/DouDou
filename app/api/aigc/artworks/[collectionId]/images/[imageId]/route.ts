import { NextRequest, NextResponse } from "next/server";
import { ArtworkModel } from "@/lib/models/artwork";
import { deleteFile } from "@/lib/tencent-cos";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { collectionId: string; imageId: string } },
) {
  try {
    const { collectionId, imageId } = params;

    // 获取图片信息
    const images = await ArtworkModel.getImages(parseInt(collectionId));
    const imageToDelete = images.find((img) => img.id === parseInt(imageId));

    if (!imageToDelete) {
      return NextResponse.json({ error: "图片不存在" }, { status: 404 });
    }

    // 从COS删除文件
    try {
      // 从完整URL中提取对象键
      const urlObj = new URL(imageToDelete.file_url);
      const objectKey = urlObj.pathname.substring(1); // 移除开头的斜杠

      const deleteResult = await deleteFile(objectKey);
      if (!deleteResult) {
      }
    } catch (cosError) {
      // 即使COS删除失败，也继续删除数据库记录
    }

    // 从数据库删除图片记录
    const deleteResult = await ArtworkModel.deleteImage(parseInt(imageId));

    if (deleteResult) {
      return NextResponse.json({
        success: true,
        message: "图片删除成功",
      });
    } else {
      return NextResponse.json({ error: "图片删除失败" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "删除图片失败" }, { status: 500 });
  }
}
