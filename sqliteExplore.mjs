import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const db = open({
  filename: path.join(__dirname, 'datasets', '04_Cookie_Databases','tranco_05May_20210510_201615.sqlite'),
  driver: sqlite3.Database
});

fs.writeFileSync('cat_names.json', JSON.stringify((await (await db).all(`SELECT DISTINCT cat_name FROM consent_data LIMIT 10000;`)).map(row => row.cat_name), null, 2));


console.log(
  // (await (await db).all(`SELECT DISTINCT cat_name FROM consent_data LIMIT 10000;`)).map(row => row.cat_name)
)

// console.log(
//   (await (await db).all(`SELECT * FROM consent_data LIMIT 1;`))
// )


// console.log(
//   (await (await db).all(`SELECT DISTINCT cat_name, purpose FROM consent_data LIMIT 100;`))
// )

// async function *getConsentData() {
//   for (let i = 0;; i++) {
//     const res = await (await db).get(`SELECT * FROM consent_data LIMIT 1 OFFSET ${i};`);
//     if (!res) {
//       break;
//     }
//     yield res;
//   }
// }

// async function main() {
//   let i = 0;
//   for await (const data of getConsentData()) {
//     if (i++ > 100) {
//       break;
//     }
//     console.log(data);
//   }
// }

// main();

// for (let i = 0; i < 10; i++) {
//     const res = await db.get(`SELECT * FROM consent_data LIMIT 1 OFFSET ${i};`);
//     console.log(res);
    
// }

// console.log(db.run('sp_help javascript_cookies;'));
// console.log(db.run('SELECT table_name FROM all_tables;'));
// db.run('sp_help tablename')
