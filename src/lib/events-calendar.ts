export type Language = 'es' | 'en' | 'zh';

type Translation = Record<Language, string>;
export interface CalendarEvent {
  id: string;
  sortDate: string;
  sortTime?: string;
  title: Translation;
  date: Translation;
  venue: Translation;
  category: Translation;
  description: Translation;
  url: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}
export interface CalendarData { months: Record<string, CalendarEvent[]>; }

export const calendarCopy = {
  es: {
    locale: 'es-MX', label: '06 / Eventos del mes', title: 'La ciudad también se disfruta.',
    description: 'Conciertos, espectáculos y exposiciones para completar tu estancia. Descubre la agenda de Ciudad de México desde Business Suites SG, en la colonia Cuauhtémoc, cerca de Reforma.',
    order: 'En orden cronológico', timezone: 'Horarios de Ciudad de México. Confirma fechas y disponibilidad con cada organizador.',
    source: 'Información oficial', book: 'Consultar disponibilidad',
    empty: 'Estamos preparando la agenda de este mes. Consulta disponibilidad para tu estancia y descubre la ciudad desde Business Suites SG.',
  },
  en: {
    locale: 'en-US', label: '06 / This month’s events', title: 'Make time for the city.',
    description: 'Concerts, live shows and exhibitions to enjoy during your stay. Explore Mexico City’s events from Business Suites SG in Colonia Cuauhtémoc, near Reforma.',
    order: 'In date order', timezone: 'All times are in Mexico City time. Confirm dates and availability with each organiser.',
    source: 'Official information', book: 'Check availability',
    empty: 'We are preparing this month’s programme. Check availability for your stay and explore the city from Business Suites SG.',
  },
  zh: {
    locale: 'zh-CN', label: '06 / 本月活动', title: '工作之余，探索城市。',
    description: '音乐会、现场演出与艺术展览，为您的入住增添精彩。Business Suites SG 位于 Cuauhtémoc，靠近 Reforma，是探索墨西哥城的舒适出发点。',
    order: '按日期排列', timezone: '所有时间均为墨西哥城当地时间。请通过主办方官方渠道确认日期及余票情况。',
    source: '查看官方信息', book: '查询房态',
    empty: '本月活动日程正在筹备中。欢迎查询房态，从 Business Suites SG 出发探索墨西哥城。',
  },
} as const;

export function mexicoMonth(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit',
  }).formatToParts(date);
  return `${parts.find(part => part.type === 'year')!.value}-${parts.find(part => part.type === 'month')!.value}`;
}

export function monthEvents(data: CalendarData, month: string): CalendarEvent[] {
  return [...(data.months[month] || [])].sort((left, right) =>
    left.sortDate.localeCompare(right.sortDate) || (left.sortTime || '').localeCompare(right.sortTime || '') || left.id.localeCompare(right.id));
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, character => entities[character]);
}

function publicUrl(value: string): string {
  if (/^\/assets\/events\/[a-z0-9-]+\.webp$/.test(value)) return value;
  try { return ['https:', 'http:'].includes(new URL(value).protocol) ? escapeHtml(value) : ''; }
  catch { return ''; }
}

export function renderAgenda(data: CalendarData, month: string, language: Language, booking: string): string {
  const copy = calendarCopy[language];
  const events = monthEvents(data, month);
  const heading = new Intl.DateTimeFormat(copy.locale, { year: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${month}-15T12:00:00Z`));
  const local = (value: Translation) => escapeHtml(value[language]);
  return `<div class="container events__inner">
    <header class="events__intro"><p class="section-label">${copy.label}</p>
      <div class="events__heading"><div><p class="events__period">${escapeHtml(heading)}</p><h2 class="display" id="events-title">${copy.title}</h2></div>
      <div><p class="events__description">${copy.description}</p><a class="button" href="${publicUrl(booking)}" target="_blank" rel="noopener noreferrer">${copy.book} <span aria-hidden="true">↗</span></a></div></div>
      <p class="events__note">${copy.order} · ${copy.timezone}</p></header>
    ${events.length ? `<div class="events__grid">${events.map(event => `<article class="events__card" data-event-id="${escapeHtml(event.id)}" data-start-date="${escapeHtml(event.sortDate)}" data-start-time="${escapeHtml(event.sortTime || '')}">
      ${publicUrl(event.imageUrl) ? `<div class="events__image"><img src="${publicUrl(event.imageUrl)}" alt="${local(event.title)}" width="${event.imageWidth}" height="${event.imageHeight}" loading="lazy" decoding="async" /></div>` : ''}
      <div class="events__body"><p class="events__category">${local(event.category)}</p><h3>${local(event.title)}</h3>
      <p class="events__date">${local(event.date)}</p><p class="events__venue">${local(event.venue)}</p>
      <p class="events__summary">${local(event.description)}</p><a class="events__source" href="${publicUrl(event.url)}" target="_blank" rel="noopener noreferrer">${copy.source} <span aria-hidden="true">↗</span></a></div></article>`).join('')}</div>` : `<p class="events__empty">${copy.empty}</p>`}
    </div>`;
}
