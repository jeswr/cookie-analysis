import 'dotenv/config';
import { LocalFileCache } from 'langchain/cache/file_system';
import { ChatOpenAI } from '@langchain/openai';
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

async function run() {
  const model = new ChatOpenAI({
    model: 'gpt-4o',
    cache: await LocalFileCache.create('./cache'),
  });
  //   const dtouPaper = await cachedFetch('https://arxiv.org/html/2403.07587v1');
  const response = await model.invoke('Is there much use in LangSmith for research prototypes?');
  console.log(response.content);
}

run();
