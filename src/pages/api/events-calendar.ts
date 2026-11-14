import type { APIRoute } from 'astro';
import { getCalendarResponse } from '../../server/events-calendar';

export const prerender = false;
export const ALL: APIRoute = ({ request }) => getCalendarResponse(request);
