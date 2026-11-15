import type { APIRoute } from 'astro';
import { absoluteUrl } from '../data/seo';

export const GET: APIRoute = () => new Response(
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
