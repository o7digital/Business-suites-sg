import type { APIRoute } from 'astro';
import { absoluteUrl, pagePaths, languages, htmlLanguage } from '../data/seo';

export const GET: APIRoute = () => {
  const urls = Object.values(pagePaths).flatMap(paths => languages.map(language =>
    `<url><loc>${absoluteUrl(paths[language])}</loc>${languages.map(alternate =>
      `<xhtml:link rel="alternate" hreflang="${htmlLanguage[alternate]}" href="${absoluteUrl(paths[alternate])}" />`
    ).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(paths.es)}" /></url>`
  )).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
