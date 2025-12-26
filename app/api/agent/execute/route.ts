import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 转发请求到Python Agent后端
    const response = await fetch(
      `${process.env.PYTHON_BACKEND_URL}/api/agent/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Agent service unavailable",
        message: "Python后端服务暂时不可用，请稍后重试",
      },
      { status: 503 },
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input");
  const sessionId = searchParams.get("session_id") || "default";

  // 如果没有 input 参数，返回状态信息
  if (!input) {
    return NextResponse.json({
      status: "Agent API proxy is running",
      backend: process.env.PYTHON_BACKEND_URL || "Not configured",
    });
  }

  try {
    // 转发 SSE 流式请求到 Python 后端
    const backendUrl = new URL(
      "/api/agent/stream",
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
    );

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    // 流式转发响应
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    // 返回 SSE 格式的错误
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const errorData = JSON.stringify({
          type: "error",
          error: "Agent service unavailable",
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
