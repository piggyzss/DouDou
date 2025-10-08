import { NextRequest, NextResponse } from "next/server";
import { VideoModel } from "@/lib/models/video";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);
    if (!id || Number.isNaN(id))
      return NextResponse.json({ error: "无效的ID" }, { status: 400 });
    const ok = await VideoModel.delete(id);
    if (!ok)
      return NextResponse.json({ error: "未找到该视频" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "删除视频失败" }, { status: 500 });
  }
}
