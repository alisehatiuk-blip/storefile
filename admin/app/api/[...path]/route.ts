import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'http://localhost:4000';

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>, method: string) {
  const { path } = await params;
  const url = new URL(req.url);
  const target = `${BACKEND}/api/${path.join('/')}${url.search}`;

  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const contentType = req.headers.get('content-type') || '';
    let body: BodyInit | undefined;

    if (!['GET', 'DELETE', 'HEAD'].includes(method)) {
      if (contentType.includes('multipart/form-data')) {
        body = await req.formData();
      } else {
        const text = await req.text();
        if (text) {
          headers['Content-Type'] = 'application/json';
          body = text;
        }
      }
    }

    const res = await fetch(target, { method, headers, body });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ success: false, message: 'خطا در اتصال به سرور' }, { status: 503 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params, 'GET');
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params, 'POST');
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params, 'PUT');
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params, 'PATCH');
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params, 'DELETE');
}
