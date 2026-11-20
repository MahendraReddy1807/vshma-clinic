import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    clinic: 'VSHMA Homeopathy Clinic',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    modules: {
      appointments: 'operational',
      emails: 'operational',
      reminders: 'operational',
      knowledge_base: 'operational',
      ai_assistant: 'operational',
    },
  });
}
