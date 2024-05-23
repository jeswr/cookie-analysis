import { parse } from 'node-html-parser';
import dumbcsv from 'dumb-csv';
import { cachedFetch } from './fetch';

interface OCD {
    ID: string,
    Platform: string,
    Category: string,
    'Cookie / Data Key name': string,
    Domain: string,
    Description: string,
    'Retention period': string,
    'Data Controller': string,
    'User Privacy & GDPR Rights Portals': string,
    'Wildcard match': number
}

async function ocd() {
  const openCookieDatabase = 'https://raw.githubusercontent.com/jkwakman/Open-Cookie-Database/master/open-cookie-database.csv';
  const res = await cachedFetch(openCookieDatabase);
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

async function main() {
  // const res = await cachedFetch(
  // 'https://gist.githubusercontent.com/bejaneps/ba8d8eed85b0c289a05c750b3d825f61/raw/6827168570520ded27c102730e442f35fb4b6a6d/websites.csv');
  // const websites = res
  // .split('\n').map(line => line.split(',')[1]?.replaceAll('"', '')).slice(0, 5);

  // console.log(await ocd())
  const ocdRecord = await ocd();

  for (let i = 0; i < 50; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const cookiePage = parse(await cachedFetch(`https://cookiepedia.co.uk/cookie/${i}`));
    const content = cookiePage.getElementById('content');
    const [cookieName, siteName] = content?.getElementsByTagName('h1')[0].text.split(' on ') ?? [];
    if (siteName && cookieName) {
      console.log(cookieName, siteName, ocdRecord[cookieName]);
    }

    // console.log(cookiePage)
    // const root = parse(cookiePage);
    // console.log(root.getElementById('content')?.getElementsByTagName('h1')[0].text);
  }

  // for (const site of websites) {
  //     // console.log('Fetching', 'https://cookiepedia.co.uk/website/' + site);
  //     const res = await cachedFetch('https://cookiepedia.co.uk/website/' + site);
  // const root = parse(res);
  // console.log(res);
  // }

  // console.log(websites);
}

main();
