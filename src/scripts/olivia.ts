const root = document.querySelector<HTMLElement>('[data-olivia]')!;
const query = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
const launcher = query<HTMLButtonElement>('[data-olivia-open]');
const panel = query<HTMLElement>('#olivia-panel');
const input = query<HTMLTextAreaElement>('[data-olivia-input]');
const consent = query<HTMLInputElement>('[data-olivia-consent]');
const form = query<HTMLFormElement>('[data-olivia-form]');
const send = query<HTMLButtonElement>('[data-olivia-send]');
const messages = query<HTMLElement>('[data-olivia-messages]');
const status = query<HTMLElement>('[data-olivia-status]');
const language = document.documentElement.lang === 'en' ? 'en' : 'es';
const conversationId = crypto.randomUUID();
let identity: string | null = null;
let sending = false;

launcher.addEventListener('click', () => {
  panel.hidden = false;
  launcher.hidden = true;
  launcher.setAttribute('aria-expanded', 'true');
  if (consent.checked) input.focus(); else consent.focus();
});
function close() {
  panel.hidden = true;
  launcher.hidden = false;
  launcher.setAttribute('aria-expanded', 'false');
  launcher.focus({ preventScroll: true });
}
query<HTMLButtonElement>('[data-olivia-close]').addEventListener('click', close);
root.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(); }
});

async function getIdentity(refresh = false) {
  if (refresh) identity = null;
  if (!identity) {
    const response = await fetch('/api/olivia/session', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok || result.clientCode !== 'business-suites-sg' || typeof result.identity !== 'string') throw new Error('unavailable');
    identity = result.identity;
  }
  return identity!;
}
async function ask(message: string, retry = true): Promise<Response> {
  const token = await getIdentity();
  const response = await fetch('/api/olivia/chat', {
    method: 'POST', signal: AbortSignal.timeout(65000),
    headers: { 'Content-Type': 'application/json', 'X-Olivia-Widget-Identity': token },
    body: JSON.stringify({ message, language, consent: consent.checked, conversationId }),
  });
  if (response.status === 401 && retry) { await getIdentity(true); return ask(message, false); }
  return response;
}
function append(text: string, user = false) {
  const bubble = document.createElement('p');
  bubble.className = `olivia-message olivia-message--${user ? 'user' : 'assistant'}`;
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const message = input.value.trim();
  if (!message || !consent.checked) return;
  sending = true;
  send.disabled = true;
  input.readOnly = true;
  append(message, true);
  status.textContent = language === 'en' ? 'Olivia is preparing your reply…' : 'Olivia está preparando tu respuesta…';
  try {
    const response = await ask(message);
    if (response.status === 429) throw new Error('rate');
    if (!response.ok) throw new Error('unavailable');
    const result = await response.json();
    if (result.clientCode !== 'business-suites-sg' || typeof result.reply !== 'string') throw new Error('unavailable');
    append(result.reply);
    input.value = '';
    status.textContent = '';
  } catch (error) {
    status.textContent = error instanceof Error && error.message === 'rate'
      ? (language === 'en' ? 'Please wait a moment before sending another message.' : 'Espera un momento antes de enviar otro mensaje.')
      : (language === 'en' ? 'Olivia is temporarily unavailable. Please try again or contact the hotel below.' : 'Olivia no está disponible en este momento. Inténtalo de nuevo o contacta al hotel abajo.');
  } finally {
    sending = false;
    send.disabled = false;
    input.readOnly = false;
    if (!panel.hidden) input.focus({ preventScroll: true });
  }
});
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
});
