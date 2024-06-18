import dumbcsv from 'dumb-csv';
import { cachedFetch } from './fetch';
import { OCD } from './types/OCD';

export async function ocd() {
  const openCookieDatabase = 'https://raw.githubusercontent.com/jkwakman/Open-Cookie-Database/master/open-cookie-database.csv';
  const res = await (await cachedFetch(openCookieDatabase)).text();
  const json = dumbcsv.fromCSV({ data: res, separator: ',' }).toJSON() as OCD[];
  const record: Record<string, OCD> = {};
  for (const entry of json) {
    const key = entry['Cookie / Data Key name'];
    if (record[key]) {
      console.log('Duplicate key', key);
    }
    record[key] = entry;
  }
  return record;
}
