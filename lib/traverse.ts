import { QueryEngine } from '@comunica/query-sparql-link-traversal';
// import { QueryEngine } from "@comunica/query-sparql";

const fetchFn = globalThis.fetch;

// @ts-ignore
globalThis.fetch = (...args) => {
    console.log(args[0]);
    return fetchFn(...args);
}

async function run() {
    const engine = new QueryEngine();
    const res = await engine.queryQuads('CONSTRUCT { ?s ?p ?o } WHERE { ?s a <https://w3id.org/dpv#Purpose> ; ?p ?o . }', { sources: ['https://w3id.org/dpv#Purpose'], lenient: true });

    let i = 0;
    res.on('data', (quad) => {
        // console.log(i += 1);
    });
}

run();
