import { QueryEngine } from '@comunica/query-sparql';
import { cachedFetch } from './fetch';

export async function pageFetch() {
    const engine = new QueryEngine();

    let i = 0;
    const record: Record<number, string> = {};
    const bindings = await engine.queryBindings('SELECT ?concept ?definition ?label ?note WHERE { ?concept a <https://w3id.org/dpv#Purpose>; <http://www.w3.org/2004/02/skos/core#definition> ?definition; <http://www.w3.org/2004/02/skos/core#prefLabel> ?label. OPTIONAL { ?concept <http://www.w3.org/2004/02/skos/core#scopeNote> ?note }  }', { sources: ['https://w3id.org/dpv#'], fetch: cachedFetch });
    const bindingsArray = await bindings.toArray();
    const page =
        '"Concept ID"\t"Definition"\t"Label"\t"Note (optional)"\n'
        + bindingsArray.map(elem => (record[++i] = elem.get('concept')!.value, i) + '\t"' + elem.get('definition')!.value + '"\t"' + elem.get('label')!.value + '"\t' + (elem.has('note') ? '"' + elem.get('note')?.value + '"' : "")).join('\n');
    
    return { record, page, bindingsArray };
}
