import { parse } from 'node-html-parser';
import dumbcsv from 'dumb-csv';
import { cachedFetch } from './fetch';
import { OCD } from './types/OCD';

async function ocd() {
    const openCookieDatabase = 'https://raw.githubusercontent.com/jkwakman/Open-Cookie-Database/master/open-cookie-database.csv';
    const res = await (await cachedFetch(openCookieDatabase)).text();
    const json = dumbcsv.fromCSV({ data: res, separator: ',' }).toJSON() as OCD[];
    const record: Set<string> = new Set();
    for (const entry of json) {
        record.add(entry['Category']);
    }
    return record;
}

ocd().then(console.log);
