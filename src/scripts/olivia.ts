import { oliviaCopy, privacyPath, bookingUrl, type OliviaLanguage } from '../data/olivia';

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
const actions = [...root.querySelectorAll<HTMLButtonElement>('[data-olivia-action]')];
const languages = [...root.querySelectorAll<HTMLButtonElement>('[data-olivia-language]')];
let language: OliviaLanguage = root.dataset.language === 'zh' ? 'zh' : root.dataset.language === 'en' ? 'en' : 'es';
const conversationId = crypto.randomUUID();
let identity: string | null = null;
let sending = false;

function updateControls() {
  input.disabled = !consent.checked || sending;
  send.disabled = input.disabled;
  actions.forEach(button => { button.disabled = input.disabled; });
  languages.forEach(button => { button.disabled = sending; });
  consent.disabled = sending;
}
function setLanguage(next: OliviaLanguage) {
  language = next;
  const copy = oliviaCopy[language];
  root.dataset.language = language;
  panel.lang = language === 'zh' ? 'zh-Hans' : language;
  root.querySelectorAll<HTMLElement>('[data-olivia-copy]').forEach(element => {
    element.textContent = String(copy[element.dataset.oliviaCopy as keyof typeof copy]);
  });
  query('[data-olivia-welcome]').textContent = copy.welcome;
  launcher.setAttribute('aria-label', copy.open);
  launcher.title = copy.name;
  query('[data-olivia-close]').setAttribute('aria-label', copy.close);
  query('.olivia-languages').setAttribute('aria-label', copy.languages);
  messages.setAttribute('aria-label', copy.name);
  languages.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.oliviaLanguage === language)));
  actions.forEach((button, index) => { button.textContent = copy.actions[index].label; });
  query<HTMLAnchorElement>('[data-olivia-privacy]').href = privacyPath(language);
  query<HTMLAnchorElement>('[data-olivia-booking]').href = bookingUrl(language);
  input.placeholder = copy.placeholder;
  send.setAttribute('aria-label', copy.send);
  status.textContent = '';
}
languages.forEach(button => button.addEventListener('click', () => {
  if (!sending) setLanguage(button.dataset.oliviaLanguage as OliviaLanguage);
}));
consent.addEventListener('change', () => { updateControls(); if (consent.checked) input.focus(); });
updateControls();

function close() {
  panel.hidden = true;
  launcher.setAttribute('aria-expanded', 'false');
  launcher.focus({ preventScroll: true });
}
launcher.addEventListener('click', () => {
  if (!panel.hidden) { close(); return; }
  panel.hidden = false;
  launcher.setAttribute('aria-expanded', 'true');
  if (consent.checked && !sending) input.focus(); else consent.focus();
});
query<HTMLButtonElement>('[data-olivia-close]').addEventListener('click', close);
root.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(); }
});

async function getIdentity(refresh = false) {
  if (refresh) identity = null;
  if (!identity) {
    const response = await fetch('/api/olivia/session', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
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
function renderReply(bubble: HTMLElement, text: string) {
  // Build text nodes and HTTPS anchors; model output is never inserted as HTML.
  bubble.replaceChildren();
  const pattern = /https:\/\/[^\s<>"']+/g;
  let previous = 0;
  for (const match of text.matchAll(pattern)) {
    const url = match[0].replace(/[).,;!?:。），；！：]+$/u, '');
    bubble.append(document.createTextNode(text.slice(previous, match.index)));
    const link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    bubble.append(link);
    previous = match.index + url.length;
  }
  bubble.append(document.createTextNode(text.slice(previous)));
}
function append(text: string, user = false) {
  const bubble = document.createElement('p');
  bubble.className = `olivia-message olivia-message--${user ? 'user' : 'assistant'}`;
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}
async function sendMessage(message: string) {
  message = message.trim();
  if (sending || !consent.checked || !message || message.length > 4000) return;
  sending = true;
  updateControls();
  status.textContent = '';
  append(message, true);
  input.value = '';
  const pending = append(oliviaCopy[language].typing);
  messages.setAttribute('aria-busy', 'true');
  try {
    const response = await ask(message);
    if (response.status === 429) throw new Error('rate');
    if (!response.ok) throw new Error('unavailable');
    const result = await response.json();
    if (result.clientCode !== 'business-suites-sg' || typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('unavailable');
    renderReply(pending, result.reply);
  } catch (error) {
    pending.remove();
    input.value = message;
    status.textContent = error instanceof Error && error.message === 'rate' ? oliviaCopy[language].rate : oliviaCopy[language].error;
  } finally {
    sending = false;
    messages.removeAttribute('aria-busy');
    messages.scrollTop = messages.scrollHeight;
    updateControls();
    if (!panel.hidden && consent.checked) input.focus({ preventScroll: true });
  }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (form.reportValidity()) void sendMessage(input.value);
});
actions.forEach((button, index) => button.addEventListener('click', () => { void sendMessage(oliviaCopy[language].actions[index].prompt); }));
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
});
