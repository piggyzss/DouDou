import { NextRequest, NextResponse } from "next/server";
import { AppModel } from "@/lib/models/app";

// 获取应用统计数据
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的应用ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    // 检查应用是否存在
    const app = await AppModel.findById(id);
    if (!app) {
      return NextResponse.json({ error: "应用不存在" }, { status: 404 });
    }

    // 获取统计数据
    const stats = await AppModel.getStats(id, days);

    return NextResponse.json({
      app_id: id,
      stats,
      days,
    });
  } catch (error) {
    
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}

// 更新应用统计数据
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的应用ID" }, { status: 400 });
    }

    const body = await request.json();
    const { date, dau, downloads } = body;

    if (!date) {
      return NextResponse.json({ error: "缺少日期参数" }, { status: 400 });
    }

    // 检查应用是否存在
    const app = await AppModel.findById(id);
    if (!app) {
      return NextResponse.json({ error: "应用不存在" }, { status: 404 });
    }

    // 更新统计数据
    await AppModel.updateDailyStats(id, date, {
      dau: dau || 0,
      downloads: downloads || 0,
    });

    return NextResponse.json({
      message: "统计数据更新成功",
    });
  } catch (error) {
    
    return NextResponse.json({ error: "更新统计数据失败" }, { status: 500 });
  }
}
