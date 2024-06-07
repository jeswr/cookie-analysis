import 'dotenv/config';
import { datasetFromShape } from '@jeswr/utils';
import { RequestShapeShapeType } from './ldo/odrl.shapeTypes';
import { OCD } from './types/OCD';
// import { LocalFileCache } from 'langchain/cache/file_system';
// import { ChatOpenAI } from '@langchain/openai';
// import {} from "@langchain/community/vectorstores/"
// import { cachedFetch } from './fetch';

// https://arxiv.org/pdf/2404.13426
// Moreover, ML models
// were trained with DPV’s taxonomies to identify personal data processing activ-
// ities in code repositories [80, 41] and textual datasets [32, 33]. DPV’s outputs
// were also used to model access and usage control policies [12, 10, 16, 82], and
// in particular applied to Solid [20, 25, 14, 13, 30, 3, 19] and health data-sharing
// use cases [78, 61], as well as to describe consent records and contracts for sensor
// data [49, 50].

async function run(ocd: OCD) {
  const dataset = datasetFromShape(RequestShapeShapeType, {
    '@id': `urn:${ocd.ID}`,
    target: [{
      '@id': ocd['Cookie / Data Key name'],
    }],
    uid: [ocd.ID],
    // FIXME: See if this should be a URI
    profile: ['https://w3id.org/oac#'],
    permission: [{
      action: ['read'],
      target: [ocd['Cookie / Data Key name']],
      constraint: [{

        // "http://www.w3.org/ns/odrl/2/hasPolicy": [{
        //     "@id": 'urn:' + ocd.ID
        // }],
        // ['http://www.w3.org/ns/odrl/2/hasPolicy']: [{}]
      }],
    }],
  });

  console.log(...dataset);

//   const model = new ChatOpenAI({
//     model: 'gpt-4o',
//     cache: await LocalFileCache.create('./cache'),
//   });
//   //   const dtouPaper = await cachedFetch('https://arxiv.org/html/2403.07587v1');
//   const { content } = await model.invoke(
//     'Is there much use in LangSmith for research prototypes?'
// );
//   console.log(content);
}

run({
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

// function createRequest() {

// }
