import 'dotenv/config';
import { Store, DataFactory } from 'n3';
import { rdf, foaf, dc } from "rdf-namespaces";
import { datasetFromShape } from '@jeswr/utils';
import { RequestShapeShapeType, LogicalConstraintShapeShapeType } from './ldo/odrl.shapeTypes';
import { OCD } from './types/OCD';
// import { LocalFileCache } from 'langchain/cache/file_system';
// import { ChatOpenAI } from '@langchain/openai';
// import {} from "@langchain/community/vectorstores/"
// import { cachedFetch } from './fetch';
const { namedNode, quad, literal, blankNode } = DataFactory;

const ODRL = 'http://www.w3.org/ns/odrl/2/';
const DPV = 'https://w3id.org/dpv#';
const OAC = 'https://w3id.org/oac#';
const XSD = 'http://www.w3.org/2001/XMLSchema#';

const categories = {
    'Marketing': DPV + 'Marketing',
    // FIXME: Fix this using description + response form beatriz
    'Functional': DPV + 'ServiceProvision',
    // FIXME: Fix this using description + response form beatriz
    'Analytics': DPV + 'TODO'
}

function createDataController(ocd: OCD) {
    return new Store([
        quad(namedNode(`https://${ocd.Domain}/`), namedNode(rdf.type), namedNode(DPV + 'DataController')),
        quad(namedNode(`https://${ocd.Domain}/`), namedNode(DPV + 'hasName'), literal(ocd.Platform)),
        quad(namedNode(`https://${ocd.Domain}/`), namedNode(foaf.page), namedNode(`https://${ocd.Domain}/`)),
    ]);
}

function getDurationString(duration: string) {
    const [amount, unit] = duration.split(' ');
    return `P${amount}${unit[0].toUpperCase()}`;
}

// https://arxiv.org/pdf/2404.13426
// Moreover, ML models
// were trained with DPV’s taxonomies to identify personal data processing activ-
// ities in code repositories [80, 41] and textual datasets [32, 33]. DPV’s outputs
// were also used to model access and usage control policies [12, 10, 16, 82], and
// in particular applied to Solid [20, 25, 14, 13, 30, 3, 19] and health data-sharing
// use cases [78, 61], as well as to describe consent records and contracts for sensor
// data [49, 50].

async function run(ocd: OCD) {
    const requestUri = namedNode(`urn:${ocd.ID}`);
    const permission = blankNode();
    const periodConstraint = blankNode();

    const store = new Store([
        quad(requestUri, namedNode(rdf.type), namedNode(ODRL + 'Request')),
        quad(requestUri, namedNode(ODRL + 'uid'), literal(ocd.ID)),
        quad(requestUri, namedNode(ODRL + 'permission'), permission),
        quad(requestUri, namedNode(ODRL + 'profile'), namedNode(OAC)),
        quad(permission, namedNode(ODRL + 'constraint'), periodConstraint),

        // Add the retention period constraint
        quad(periodConstraint, namedNode(dc.title), literal(`Rule can be exercised in the next ${ocd['Retention period']}.`)),
        quad(periodConstraint, namedNode(ODRL + 'rightOperand'), literal(getDurationString(ocd['Retention period']), namedNode(XSD + 'duration'))),
        quad(periodConstraint, namedNode(ODRL + 'operator'), namedNode(ODRL + 'eq')),
        quad(periodConstraint, namedNode(ODRL + 'leftOperand'), namedNode(ODRL + 'elapsedTime')),


        // quad(permission, namedNode(ODRL + 'action'), namedNode(ODRL + 'read')),
        // quad(permission, namedNode(ODRL + 'target'), namedNode(ODRL + 'Cookie')),
        // quad(permission, namedNode(ODRL + 'constraint'), blankNode()),
        // quad(blankNode(), namedNode(ODRL + 'hasPolicy'), namedNode(`urn:${ocd.ID}`)),
    ]);

    console.log(...store);

    // const store = new Store([
    //     quad(requestUri, namedNode(rdf.type), namedNode(ODRL + 'Request')),
    //     quad(requestUri, namedNode(ODRL + 'uid'), literal(ocd.ID)),
    // ]);


    // quad(requestUri, namedNode(ODRL + 'target'), namedNode(ODRL + 'Cookie')),
    // store.addQuads([
    //     namedNode
    // ]);


      const dataset = datasetFromShape(RequestShapeShapeType, {
        '@id': `urn:${ocd.ID}`,
        target: [{
          '@id': ocd['Cookie / Data Key name'],
        }],
        uid: [ocd.ID],
        // FIXME: See if this should be a URI
        profile: ['https://w3id.org/oac#'],
        permission: [{
          action: [{
            
          }],
          target: [{
            "@id": ocd['Cookie / Data Key name'],
          }],
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
