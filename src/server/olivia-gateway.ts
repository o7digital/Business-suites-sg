import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const CLIENT = 'business-suites-sg';
export const COOKIE = 'business_sg_olivia';
type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: Record<string, unknown>): void;
};
type Context = { request: Request; cookies: CookieStore; address?: string; path: string };

const json = (value: Record<string, unknown>, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
const equal = (left: string, right: string) => {
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export function createGateway(key: string, fetchUpstream: typeof fetch = fetch) {
  const sign = (value: string) => createHmac('sha256', key).update(value).digest('hex');
  return async ({ request, cookies, address, path }: Context): Promise<Response> => {
    if (key.length < 43) return json({ error: 'Olivia is temporarily unavailable' }, 503);
    const origin = request.headers.get('origin');
    const ownOrigin = new URL(request.url).origin;
    if ((origin && origin !== ownOrigin) || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Invalid origin' }, 403);
    const stored = cookies.get(COOKIE)?.value || '';
    const [id, expiry, signature] = stored.split('.');
    const valid = /^[a-f0-9]{32}$/.test(id || '') && /^\d+$/.test(expiry || '') && Number(expiry) > Date.now() && Number(expiry) <= Date.now() + 3600000 && equal(signature || '', sign(`session:${id}.${expiry}`));
    if (request.method === 'GET' && path === 'session') {
      const sessionId = valid ? id : randomBytes(16).toString('hex');
      if (!valid) {
        const expires = String(Date.now() + 3600000);
        cookies.set(COOKIE, `${sessionId}.${expires}.${sign(`session:${sessionId}.${expires}`)}`, { httpOnly: true, secure: ownOrigin.startsWith('https:'), sameSite: 'strict', path: '/api/olivia', maxAge: 3600 });
      }
      return json({ clientCode: CLIENT, identity: sign(`widget:${sessionId}`), version: '3.6.0' });
    }
    if (request.method !== 'POST' || path !== 'chat') return json({ error: 'Not found' }, 404);
    if (origin !== ownOrigin) return json({ error: 'Origin required' }, 403);
    if (!valid || !equal(request.headers.get('x-olivia-widget-identity') || '', sign(`widget:${id}`))) return json({ error: 'Session expired' }, 401);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) return json({ error: 'JSON required' }, 415);
    if (Number(request.headers.get('content-length') || 0) > 16000) return json({ error: 'Request too large' }, 413);
    let payload: Record<string, unknown>;
    try {
      const reader = request.body?.getReader();
      if (!reader) return json({ error: 'Message required' }, 400);
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16000) { await reader.cancel(); return json({ error: 'Request too large' }, 413); }
        chunks.push(value);
      }
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return json({ error: 'Invalid JSON' }, 400); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(field => !['message', 'language', 'consent', 'conversationId'].includes(field))) return json({ error: 'Invalid payload' }, 400);
    if (payload.consent !== true) return json({ error: 'Consent required' }, 400);
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message || message.length > 4000 || typeof payload.conversationId !== 'string' || !/^[a-f0-9-]{36}$/i.test(payload.conversationId)) return json({ error: 'Invalid message' }, 400);
    if (!['es', 'en'].includes(String(payload.language))) return json({ error: 'Invalid language' }, 400);
    try {
      const upstream = await fetchUpstream('https://olivia.o7digitalgroup.com/business-suites-sg/chat', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(55000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ message, language: payload.language, consent: true,
          conversation_id: sign(`conversation:${id}:${payload.conversationId}`).slice(0, 48), session_id: id,
          client_hash: sign(`client:${request.headers.get('x-vercel-forwarded-for') || address || id}`),
        }),
      });
      if (!upstream.ok) return json({ error: 'Olivia is temporarily unavailable' }, upstream.status === 429 ? 429 : 502);
      const result = await upstream.json();
      if (result.clientCode !== CLIENT || typeof result.reply !== 'string' || !result.reply.trim() || result.reply.length > 16000) return json({ error: 'Invalid hotel response' }, 502);
      return json({ reply: result.reply, clientCode: CLIENT, version: '3.6.0' });
    } catch { return json({ error: 'Olivia is temporarily unavailable' }, 502); }
  };
}
