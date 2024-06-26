import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { LocalFileCache } from 'langchain/cache/file_system';
// import cat_names from './cat_names.json' with { type: 'json' };
import fs from 'fs';
import { translate } from 'google-translate-api-x';
import { cachedFetch } from './lib/fetch';
// import { translate } from 'google-translate-api';

async function main() {
    const cat_names = JSON.parse(fs.readFileSync('./cat_names.json', 'utf-8'));

    const model = new ChatOpenAI({
        model: 'gpt-3.5-turbo-0125',
        cache: await LocalFileCache.create('./cache'),
    });
    
    const mappings = {};
    for (const cat of cat_names) {
        const resb = await translate(cat, { to: 'en', requestFunction: cachedFetch });
        console.log(cat, (resb as any).text);
    
        // let { content } = await model.invoke(`Translate the following text into English. If the statement is already in English make no changes. Do not respond with anything except the translation: "${cat}"`);
    
        // for (const split of [' -> ', '\" - \"', ' translates to ', ' => ', '\n\n']) {
        //     if (!cat.includes(split) && content.includes(split)) {
        //         console.log('split:', content, content.split(split));
        //         content = content.split(split)[1];
        //     }
        // }
    
        // content = content
        //     .replace(" in English.", '')
        //     .replace(/^(-|"| )+|(-|"| )+$/g, '');
    
        // mappings[cat] = content;
        // fs.writeFileSync('./translationMappings.json', JSON.stringify(mappings, null, 2));
    }
    
}

main();
