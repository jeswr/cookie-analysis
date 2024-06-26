import { defaults } from 'make-fetch-happen';

export const cachedFetch = defaults({
  cachePath: './mfhcache',
  cache: 'force-cache',
}) as unknown as typeof fetch;
