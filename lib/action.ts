import 'dotenv/config';
import dereferenceToStore from 'rdf-dereference-store';
import { write } from "@jeswr/pretty-turtle"
// import { Store, DataFactory } from 'n3';
// import { rdf, foaf, dc } from "rdf-namespaces";
// import { datasetFromShape } from '@jeswr/utils';
import { OCD } from './types/OCD';
import { LocalFileCache } from 'langchain/cache/file_system';
import { ChatOpenAI } from '@langchain/openai';
import { n3reasoner } from 'eyereasoner';
import fs from 'fs';
import { cachedFetch } from './fetch';
// import { cachedFetch } from './fetch';
// const { namedNode, quad, literal, blankNode } = DataFactory;

const rules = [
  'https://gist.githubusercontent.com/jeswr/380ed410581d307d9ab1ec5ca3f1ad52/raw/a5a14bb5b6c9339e3c7a2b52af8f9edf7a4f2cd4/owl.n3',
  'https://gist.githubusercontent.com/jeswr/eb93b870ada6f8879301bc8d3234964b/raw/4f330b179cceb65a9e41457caebf991d57baa26d/rdfs.n3',
  // 'https://github.com/w3c/dpv/blob/master/dpv/dpv.ttl',
  'https://raw.githubusercontent.com/w3c/dpv/master/dpv/dpv.ttl',
  'https://w3id.org/oac#',
  'http://purl.org/dc/dcam/',
  'http://www.w3.org/ns/dcat#',
  'http://purl.org/dc/terms/',
  'https://w3id.org/dpv#',
  'http://xmlns.com/foaf/0.1/',
  'http://www.w3.org/ns/odrl/2/',
  'http://www.w3.org/2002/07/owl#',
  'http://www.w3.org/ns/dx/prof/',
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'http://www.w3.org/2000/01/rdf-schema#',
  'http://www.w3.org/ns/dx/prof/role/',
  'https://schema.org/',
  'http://www.w3.org/2004/02/skos/core#',
  'https://specialprivacy.ercim.eu/langs/usage-policy#',
  'https://specialprivacy.ercim.eu/vocabs/data#',
  'https://specialprivacy.ercim.eu/vocabs/processing#',
  'https://specialprivacy.ercim.eu/vocabs/purposes#',
  'http://www.w3.org/2003/06/sw-vocab-status/ns#',
  'http://purl.org/vocab/vann/',
]

async function getActions(ocd: OCD) {
  const { store, prefixes } = await dereferenceToStore(rules, {
    fetch: cachedFetch as any
  });

  console.log(store.size)



  console.log('starting')

  console.time('reasoning')

  const res = await n3reasoner([...store], '{ ?s a <https://w3id.org/dpv#Processing> . ?s ?p ?o . } => { ?s ?p ?o . } .');

  console.timeEnd('reasoning')

  console.log(res.length)
  console.log(res)

  // fs.writeFileSync('./purposes.n3', await write(res, { prefixes, format: 'text/n3' }));
  fs.writeFileSync('./processing.n3', await write(res, { prefixes, format: 'text/n3' }));

  console.log(await write(res, { prefixes, format: 'text/n3' }))
  // console.log(store.size, prefixes);

  process.exit();
    // const { store, prefixes } = await dereferenceToStore('https://w3id.org/oac#');
    // console.log(await write([...store], { prefixes }))


    const model = new ChatOpenAI({
        model: 'gpt-4o',
        cache: await LocalFileCache.create('./cache'),
      });
      //   const dtouPaper = await cachedFetch('https://arxiv.org/html/2403.07587v1');
      const { content } = await model.invoke(
        'Is there much use in LangSmith for research prototypes?'
    );
      console.log(content);
}




getActions({
    // "site": "grooveshark.com",
    ID: '8dc5d7e3-e31f-421a-8bad-6540172d787f',
    Platform: 'Google',
    Category: 'Marketing',
    'Cookie / Data Key name': 'SID',
    Domain: 'google.com',
    Description: 'Download certain Google Tools and save certain preferences, for example the number of search results per page or activation of the SafeSearch Filter. Adjusts the ads that appear in Google Search.',
    'Retention period': '2 years',
    'Data Controller': 'Google',
    'User Privacy & GDPR Rights Portals': 'https://privacy.google.com/take-control.html',
    'Wildcard match': 0,
});
