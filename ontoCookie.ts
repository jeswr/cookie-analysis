import pkg from 'rdf-dereference-store';
import { DataFactory, Store } from 'n3';
const { namedNode } = DataFactory;

async function main() {
    const { store } = await pkg('https://raw.githubusercontent.com/GeniBushati/OntoCookie.io/main/ontology.ttl')
    for (const quad of store.match(null, namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), namedNode('http://www.semanticweb.org/OntoCookie#Purpose'))) {
        console.log([...store.match(quad.subject as any, namedNode('http://purl.org/dc/elements/1.1/description'), null)][0].subject.value, '\t\t', [...store.match(quad.subject as any, namedNode('http://purl.org/dc/elements/1.1/description'), null)][0].object.value);
    }
    
    // console.log(...store);        
}

main();
