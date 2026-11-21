import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { EmailProvider } from '@/lib/notifications/providers/email-provider';
import { LUXURY_EMAIL_TEMPLATES, type LuxuryEmailProps } from '@/lib/notifications/email-templates';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const { templateKey, toEmail, sampleData } = await request.json();

    if (!templateKey || !toEmail) {
      return NextResponse.json({ error: 'Template key and destination email are required' }, { status: 400 });
    }

    const generator = LUXURY_EMAIL_TEMPLATES[templateKey as keyof typeof LUXURY_EMAIL_TEMPLATES];
    if (!generator) {
      return NextResponse.json({ error: `Unknown template key: ${templateKey}` }, { status: 400 });
    }

    const defaultProps: LuxuryEmailProps = {
      patientName: sampleData?.patientName || 'Rajesh Sharma',
      referenceNumber: sampleData?.referenceNumber || 'VSHMA-2026-TEST',
      appointmentDate: sampleData?.appointmentDate || 'Saturday, 28 Nov 2026',
      appointmentTime: sampleData?.appointmentTime || '10:30 AM IST',
      consultationType: sampleData?.consultationType || 'Comprehensive Constitutional Intake',
      doctorName: 'Dr. Chihnitha Reddy T (BHMS)',
      location: 'VSHMA Homeopathy Clinic, Bengaluru, Karnataka (By Prior Appt)',
      phone: '+91 7416001477',
      email: toEmail,
      oldDate: 'Friday, 27 Nov 2026',
      oldTime: '4:00 PM IST',
      totalAppointments: 6,
      digestListHtml: `
        <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #E5E0D4;margin-bottom:8px;">
          <strong>10:30 AM</strong> - Rajesh Sharma (Constitutional Intake)<br>
          <span style="font-size:11px;color:#8F9489;">Ref: VSHMA-7821 &bull; Phone: +91 98xxx</span>
        </div>
        <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #E5E0D4;margin-bottom:8px;">
          <strong>11:45 AM</strong> - Priya Nair (Chronic Follow-up)<br>
          <span style="font-size:11px;color:#8F9489;">Ref: VSHMA-7824 &bull; Phone: +91 97xxx</span>
        </div>
        <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #E5E0D4;">
          <strong>02:30 PM</strong> - Anand Verma (Pediatric Consultation)<br>
          <span style="font-size:11px;color:#8F9489;">Ref: VSHMA-7829 &bull; Phone: +91 94xxx</span>
        </div>
      `,
    };

    const rendered = generator(defaultProps);

    const result = await EmailProvider.send({
      to: toEmail,
      subject: `[TEST PREVIEW] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to dispatch email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Test email dispatched to ${toEmail} (Honoring NOTIFY_MODE sandbox routing)`,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
