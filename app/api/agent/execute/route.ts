import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 检查环境变量是否配置
    const backendUrl = process.env.PYTHON_BACKEND_URL;
    if (!backendUrl) {
      console.error("PYTHON_BACKEND_URL is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Configuration error",
          message: "后端服务地址未配置，请联系管理员",
        },
        { status: 503 },
      );
    }

    const targetUrl = `${backendUrl}/api/agent/execute`;
    console.log(`Forwarding request to: ${targetUrl}`);

    // 转发请求到Python Agent后端
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent execute error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Agent service unavailable",
        message: "Python后端服务暂时不可用，请稍后重试",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Agent API proxy is running",
    backend: process.env.PYTHON_BACKEND_URL || "Not configured",
  });
}
