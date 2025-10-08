import { NextResponse } from "next/server";
import { BlogModel } from "../../../../lib/models/blog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await BlogModel.findAllPublished(page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
