import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:4000';

async function proxyRequest(request: NextRequest, pathParts: string[], method: string) {
  const path = pathParts.join('/');
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/api/${path}${url.search}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const auth = request.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const response = await fetch(targetUrl, {
            method,
            headers: { ...(auth ? { Authorization: auth } : {}) },
            body: formData,
          });
          const data = await response.json();
          return NextResponse.json(data, { status: response.status });
        } else {
          body = await request.text();
        }
      } catch {
        body = undefined;
      }
    }

    const response = await fetch(targetUrl, { method, headers, body });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در اتصال به سرور' }, { status: 503 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'GET');
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'POST');
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'PUT');
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'PATCH');
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'DELETE');
}
