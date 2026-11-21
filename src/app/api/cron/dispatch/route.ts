import { NextResponse } from 'next/server';
import { NotificationDispatcher } from '@/lib/notifications/dispatcher';

export async function GET(request: Request) {
  return handleDispatch(request);
}

export async function POST(request: Request) {
  return handleDispatch(request);
}

async function handleDispatch(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const cronSecretHeader = request.headers.get('x-cron-secret') || '';
    const configuredSecret = process.env.CRON_SECRET;

    // Check authorization
    const isSecretAuthorized =
      Boolean(configuredSecret) &&
      (authHeader === `Bearer ${configuredSecret}` || cronSecretHeader === configuredSecret);

    // Also allow authenticated staff admin session header for "Run dispatcher now" button
    const adminSessionHeader = request.headers.get('x-admin-session');
    const isAdminAuthorized = Boolean(adminSessionHeader && adminSessionHeader.length > 20);

    if (process.env.NODE_ENV === 'production' && !isSecretAuthorized && !isAdminAuthorized) {
      return NextResponse.json({ error: 'Unauthorized dispatcher invocation' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const result = await NotificationDispatcher.dispatchDueJobs(limit);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Kolkata',
      result,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[API Cron Dispatch Error]', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
