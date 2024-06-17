import { parse } from 'node-html-parser';
import dumbcsv from 'dumb-csv';
import { cachedFetch } from './fetch';
import { OCD } from './types/OCD';

async function ocd() {
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

// const categories = {
//   'Marketing':
//   'Functional':
//   'Analytics':
// }

async function main() {
  // const res = await cachedFetch(
  // 'https://gist.githubusercontent.com/bejaneps/ba8d8eed85b0c289a05c750b3d825f61/raw/6827168570520ded27c102730e442f35fb4b6a6d/websites.csv');
  // const websites = res
  // .split('\n').map(line => line.split(',')[1]?.replaceAll('"', '')).slice(0, 5);

  // console.log(await ocd())
  const ocdRecord = await ocd();

  for (let i = 0; i < 83; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const cookiePage = parse(await (await cachedFetch(`https://cookiepedia.co.uk/cookie/${i}`)).text());
    const content = cookiePage.getElementById('content');
    const [cookieName, siteName] = content?.getElementsByTagName('h1')[0].text.split(' on ') ?? [];
    const tableContent = content?.getElementById('content-right')?.getElementsByTagName('ul')[0];
    const table = tableContent?.getElementsByTagName('li')?.map((li) => [li.getElementsByTagName('strong')[0].text.replace(/(:|\?)$/, '') ?? 'true', li.innerHTML.split('</strong>')[1]?.trim()]);
    const tableDict = Object.fromEntries(table ?? []);
    let about = content?.getElementById('content-left')?.getElementsByTagName('h2')[0];

    let info = '';
    while (about) {
      about = about.nextElementSibling ?? undefined;
      if (about?.tagName === 'P') {
        if (info !== '') {
          info += ' ';
        }
        info += (about?.textContent ?? '');
      } else {
        break;
      }
    }

    [tableDict.Website] = (tableDict.Website ?? '').split(' ');
    if (tableDict.Host?.includes('</a>')) {
      tableDict.Host = (tableDict.Host ?? '').split('>')[1].replace('</a', '');
    }
    tableDict['Life Span (days)'] = parseInt(tableDict['Life Span (days)'] ?? '0', 10);
    tableDict['Secure cookie'] = tableDict['Secure cookie'] === 'Yes';
    tableDict['HTTPOnly cookie'] = tableDict['HTTPOnly cookie'] === 'Yes';
    tableDict['3rd party'] = 'This is a third party persistent cookie' in tableDict || 'This is a first party session cookie' in tableDict;
    tableDict.persistent = 'This is a third party persistent cookie' in tableDict || 'This is a first party persistent cookie' in tableDict;
    tableDict.Description = info;
    delete tableDict['This is a third party persistent cookie'];
    delete tableDict['This is a first party session cookie'];
    delete tableDict['This is a third party session cookie'];
    delete tableDict['This is a first party persistent cookie'];

    if (siteName && cookieName) {
      console.log(cookieName, siteName, ocdRecord[cookieName], tableDict);
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
