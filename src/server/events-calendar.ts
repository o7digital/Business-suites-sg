import type { CalendarEvent } from '../lib/events-calendar';

const SOURCE = 'https://www.businesssuiteskepler.com/api/events-calendar';
const monthPattern = /^20\d{2}-(0[1-9]|1[0-2])$/;
const translatedFields = ['title', 'date', 'venue', 'category', 'description'] as const;
const isPublicUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > 4000) return false;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); }
  catch { return false; }
};

export function validateCalendarFeed(value: unknown): { monthKey: string; available: boolean; events: CalendarEvent[] } {
  if (!value || typeof value !== 'object') throw new Error('Invalid calendar');
  const feed = value as Record<string, unknown>;
  if (typeof feed.monthKey !== 'string' || !monthPattern.test(feed.monthKey) || typeof feed.available !== 'boolean' || !Array.isArray(feed.events) || feed.events.length > 100) throw new Error('Invalid calendar');
  if (!feed.available) return { monthKey: feed.monthKey, available: false, events: [] };
  const ids = new Set();
  const events = feed.events.map((event: CalendarEvent) => {
    if (!event || typeof event.id !== 'string' || !/^[a-z0-9-]{1,160}$/.test(event.id) || ids.has(event.id)) throw new Error('Invalid event');
    ids.add(event.id);
    if (typeof event.sortDate !== 'string' || !/^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(event.sortDate) || !event.sortDate.startsWith(feed.monthKey as string)) throw new Error('Invalid event date');
    if (event.sortTime !== undefined && (typeof event.sortTime !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$|^$/.test(event.sortTime))) throw new Error('Invalid event time');
    for (const field of translatedFields) {
      if (!event[field] || !['es', 'en', 'zh'].every(lang => typeof event[field][lang as 'es' | 'en' | 'zh'] === 'string' && event[field][lang as 'es' | 'en' | 'zh'].length > 0 && event[field][lang as 'es' | 'en' | 'zh'].length <= 8000)) throw new Error('Incomplete event translation');
    }
    if (!isPublicUrl(event.url) || typeof event.imageUrl !== 'string') throw new Error('Invalid event link');
    const imageUrl = /^\/assets\/events\/[a-z0-9-]+\.webp$/.test(event.imageUrl) ? new URL(event.imageUrl, SOURCE).href : event.imageUrl;
    if (!isPublicUrl(imageUrl) || !Number.isSafeInteger(event.imageWidth) || !Number.isSafeInteger(event.imageHeight) || event.imageWidth <= 0 || event.imageHeight <= 0) throw new Error('Invalid event image');
    return { ...event, imageUrl };
  });
  return { monthKey: feed.monthKey, available: true, events };
}

export async function getCalendarResponse(request: Request, fetchUpstream: typeof fetch = fetch): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
  try {
    const response = await fetchUpstream(SOURCE, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Calendar unavailable');
    return Response.json(validateCalendarFeed(await response.json()), { headers });
  } catch {
    return Response.json({ error: 'Agenda temporarily unavailable' }, { status: 503, headers });
  }
}
