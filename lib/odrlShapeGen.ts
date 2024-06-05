// Use [Astrea](https://github.com/oeg-upm/astrea) to generated shapes based on
// the ODRL ontology.
import { cachedFetch } from './fetch';

async function run() {
    const a = await cachedFetch('https://www.w3.org/ns/odrl/2/ODRL22.ttl');
    console.log(await a.text());
    // const res = await cachedFetch('https://astrea.linkeddata.es/api/shacl/url', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         "ontologies": [
    //             "https://www.w3.org/ns/odrl/2/ODRL22.ttl"
    //         ]
    //     }),
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // });
    // console.log(await res.text());
}

run();

// https://astrea.linkeddata.es/api/shacl/url