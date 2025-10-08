import { NextRequest, NextResponse } from "next/server";
import { AppModel } from "@/lib/models/app";

// 获取标签列表
export async function GET(request: NextRequest) {
  try {
    const tags = await AppModel.getTags();
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json({ error: "获取标签列表失败" }, { status: 500 });
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: "标签名称不能为空" }, { status: 400 });
    }

    const tag = await AppModel.createTag({
      name,
      description,
      color,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "创建标签失败" }, { status: 500 });
  }
}
