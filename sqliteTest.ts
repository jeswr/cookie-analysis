import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path';

const db = open({
  filename: path.join(__dirname, 'datasets', '04_Cookie_Databases','tranco_05May_20210510_201615.sqlite'),
  driver: sqlite3.Database
});

interface ConsentData {
  id: number,
  browser_id: number,
  visit_id: number,
  name: string,
  domain: string,
  cat_id: number,
  cat_name: 'Necessary',
  purpose: 'This cookie is used to distinguish between humans and bots. This is beneficial for the website, in order to make valid reports on the use of their website.',
  expiry: 'Persistent',
  type_name: 'HTML',
  type_id: 2
}

async function *getConsentData(): AsyncIterable<ConsentData> {
  for (let i = 0;; i++) {
    const res = await (await db).get(`SELECT * FROM consent_data LIMIT 1 OFFSET ${i};`);
    if (!res) {
      break;
    }
    yield res;
  }
}

async function main() {
  let i = 0;
  for await (const data of getConsentData()) {
    if (i++ > 100) {
      break;
    }
    console.log(data);
  }
}

main();

// for (let i = 0; i < 10; i++) {
//     const res = await db.get(`SELECT * FROM consent_data LIMIT 1 OFFSET ${i};`);
//     console.log(res);
    
// }

// console.log(db.run('sp_help javascript_cookies;'));
// console.log(db.run('SELECT table_name FROM all_tables;'));
// db.run('sp_help tablename')
