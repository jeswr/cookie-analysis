import { stringToTerm } from "rdf-string";
import fs from "fs";
import { DataFactory, Quad_Graph, Store } from "n3";
import { write } from "@jeswr/pretty-turtle";
import { Quad_Object, Term } from "@rdfjs/types";
const { namedNode, literal, quad, blankNode } = DataFactory;

const store = new Store();
const file = fs.readFileSync('./owl.custom', 'utf8');
for (const line of file.split('\n')) {
    if (line !== '') {
        const [premise, conclusion] = line.split(' -> ')
            .map(elem => elem.split(' ^ '))
            // @ts-ignore
            .map(elem => elem.length === 1 && elem[0] === 'false' ? false : elem.map(term => quad(...term.slice(1, -1).split(' ').map(elem => stringToTerm(elem)))));

        const b1 = blankNode();
        let b2: Term = blankNode();

        if (!premise) {
            throw new Error('Premise is not defined');
        }

        if (conclusion) {
            const rightGraph = conclusion.map(elem => quad(elem.subject, elem.predicate, elem.object, b2 as Quad_Graph));
            store.addQuads(rightGraph);
        } else {
            b2 = literal('false', namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
        }

        const leftGraph = premise.map(elem => quad(elem.subject, elem.predicate, elem.object, b1));
        

        const rule = quad(b1, namedNode('http://www.w3.org/2000/10/swap/log#implies'), b2);

        store.addQuads([...leftGraph, rule]);
    }
    
}

write([...store], { prefixes: { log: 'http://www.w3.org/2000/10/swap/log#', owl: 'http://www.w3.org/2002/07/owl#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' }, format: 'text/n3' }).then(console.log);


// console.log(file.split('\n'));

