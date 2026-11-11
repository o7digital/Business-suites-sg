import type { APIRoute } from 'astro';
import { createGateway } from '../../../server/olivia-gateway';
export const prerender = false;

export const ALL: APIRoute = context => createGateway(process.env.OLIVIA_GATEWAY_KEY || import.meta.env.OLIVIA_GATEWAY_KEY || '')({
  request: context.request,
  cookies: context.cookies,
  address: context.clientAddress,
  path: context.params.path || '',
});
