import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const db = await open({
  filename: path.join(__dirname, 'datasets', '04_Cookie_Databases','tranco_05May_20210510_201615.sqlite'),
  driver: sqlite3.Database
});

console.log(await db.all(`SELECT DISTINCT cat_name FROM consent_data;`));


// for (let i = 0; i < 10; i++) {
//     const res = await db.get(`SELECT * FROM consent_data LIMIT 1 OFFSET ${i};`);
//     console.log(res);
    
// }

// console.log(db.run('sp_help javascript_cookies;'));
// console.log(db.run('SELECT table_name FROM all_tables;'));
// db.run('sp_help tablename')
