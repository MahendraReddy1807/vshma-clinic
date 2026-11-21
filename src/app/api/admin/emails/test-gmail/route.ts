import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { EmailProvider } from '@/lib/notifications/providers/email-provider';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { testEmail } = body;

    // 1. Verify SMTP handshake via transporter.verify()
    const verifyResult = await EmailProvider.verifyConnection();
    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          stage: 'verify',
          error: verifyResult.message,
          code: verifyResult.code,
        },
        { status: 400 }
      );
    }

    // 2. If test email provided, send a live test ping
    let sendResult = null;
    if (testEmail) {
      sendResult = await EmailProvider.send({
        to: testEmail,
        subject: 'Gmail SMTP Verification Ping — VSHMA Clinic',
        html: `
          <div style="font-family:sans-serif;padding:24px;background:#F7F3EC;color:#161815;border-radius:12px;border:1px solid #D4D8BA;">
            <h2 style="color:#121A15;margin-top:0;">Gmail SMTP Connected Successfully</h2>
            <p>This automated test message confirms that VSHMA Clinic's Gmail SMTP outbound integration is active and operating securely with Nodemailer.</p>
            <p style="font-size:12px;color:#65756B;">Sent from: <code>${process.env.GMAIL_USER || 'Not Configured'}</code></p>
          </div>
        `,
        text: 'Gmail SMTP verification ping from VSHMA Clinic. Connection verified successfully.',
      });
    }

    const quota = EmailProvider.getQuotaStats();

    return NextResponse.json({
      success: true,
      message: verifyResult.message,
      sendResult,
      quota,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
