import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/proxy/", "");
  const targetUrl = `https://fe-technical-assignment.dxtr.asia/api/v1/${path}`;

  console.log(`Proxy POST → ${targetUrl}`); 

  try {
    const body = await request.json();

    const headers = new Headers(request.headers);
    headers.set("Content-Type", "application/json"); 

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy POST error:", error);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/proxy/", "");
  const targetUrl = `https://fe-technical-assignment.dxtr.asia/api/v1/${path}`;

  console.log(`Proxy GET → ${targetUrl}`); 

  try {
    const headers = new Headers(request.headers);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy GET error:", error);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
