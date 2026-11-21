/**
 * Calendar utilities (.ics file generator and Google Calendar URL)
 * Timezone: Asia/Kolkata (IST)
 */

export interface CalendarEventProps {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  timeStr: string;   // e.g. "10:30 AM" or "10:30"
  durationMinutes?: number;
  referenceNumber: string;
}

function parseIstDateTime(dateStr: string, timeStr: string): Date {
  let hour = 10;
  let minute = 0;

  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (match) {
    hour = parseInt(match[1], 10);
    minute = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const isoIst = `${dateStr}T${pad(hour)}:${pad(minute)}:00+05:30`;
  return new Date(isoIst);
}

function formatUtcCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an iCalendar (.ics) string.
 */
export function generateIcsContent(props: CalendarEventProps): string {
  const start = parseIstDateTime(props.startDate, props.timeStr);
  const end = new Date(start.getTime() + (props.durationMinutes || 45) * 60 * 1000);

  const dtStart = formatUtcCompact(start);
  const dtEnd = formatUtcCompact(end);
  const dtStamp = formatUtcCompact(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VSHMA Homeopathy Clinic//Appointment System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:vshma-${props.referenceNumber}@vshma.in`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${props.title}`,
    `DESCRIPTION:${props.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${props.location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Returns an attachment-ready .ics object for Resend.
 */
export function generateIcsAttachment(props: CalendarEventProps): {
  filename: string;
  content: string;
  contentType: string;
} {
  return {
    filename: `vshma-appointment-${props.referenceNumber}.ics`,
    content: generateIcsContent(props),
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
  };
}

/**
 * Generates a one-click Google Calendar web link.
 */
export function generateGoogleCalendarUrl(props: CalendarEventProps): string {
  const start = parseIstDateTime(props.startDate, props.timeStr);
  const end = new Date(start.getTime() + (props.durationMinutes || 45) * 60 * 1000);

  const startUtc = formatUtcCompact(start);
  const endUtc = formatUtcCompact(end);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: props.title,
    dates: `${startUtc}/${endUtc}`,
    details: props.description,
    location: props.location,
    ctz: 'Asia/Kolkata',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
