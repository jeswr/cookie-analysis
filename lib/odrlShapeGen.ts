// Use [Astrea](https://github.com/oeg-upm/astrea) to generated shapes based on
// the ODRL ontology.
import { n3reasoner } from 'eyereasoner';
import { DataFactory, Store } from 'n3';
import * as path from 'path';
import dereference from 'rdf-dereference-store';
import { rdf, rdfs } from 'rdf-namespaces';
// import { ShapeShape } from '@jeswr/shacl2shex/dist/ldo/Shacl.typings';
import serialize from '@jeswr/rdf-serialize-store';
import * as fs from 'fs';

const { namedNode, quad, blankNode } = DataFactory;

// You can use multiple ODRL profiles simultaneously so long as you list them
// in the policies.

const shapeBase = 'http://www.w3.org/ns/odrl/2/shape/';

// https://raw.githubusercontent.com/sparna-git/owl2shacl/main/owl2sh-open.ttl
// https://raw.githubusercontent.com/sparna-git/owl2shacl/main/owl2sh-semi-closed.ttl
// https://raw.githubusercontent.com/sparna-git/owl2shacl/main/owl2sh-closed.ttl

async function run() {
  const shapes = new Store([quad(namedNode(shapeBase), namedNode(rdf.type), namedNode('http://www.w3.org/2002/07/owl#Ontology'))]);
  const { store } = await dereference('https://www.w3.org/ns/odrl/2/ODRL22.ttl');
  const rules = [
    ...store,
    ...(await dereference(path.join(__dirname, 'rules.n3'), { localFiles: true })).store,
  ];
  const domain = new Store(await n3reasoner(rules, [
    ...(await dereference(path.join(__dirname, 'domainQuery.n3'), { localFiles: true })).store,
  ]));
  const range = new Store(await n3reasoner(rules, [
    ...(await dereference(path.join(__dirname, 'rangeQuery.n3'), { localFiles: true })).store,
  ]));
  for (const { subject } of store.match(null, namedNode(rdf.type), namedNode(rdfs.Class))) {
    const properties = domain.getSubjects(namedNode(rdfs.domain), subject as any, null);
    if (properties.length !== 0) {
      const shape = namedNode(`${shapeBase + subject.value.split('/').slice(-1)[0]}Shape`);
      shapes.add(quad(shape, namedNode(rdf.type), namedNode('http://www.w3.org/ns/shacl#NodeShape')));
      shapes.add(quad(shape, namedNode('http://www.w3.org/ns/shacl#targetClass'), subject));

      for (const prop of domain.getSubjects(namedNode(rdfs.domain), subject as any, null)) {
        const property = blankNode();
        shapes.add(quad(shape, namedNode('http://www.w3.org/ns/shacl#property'), property));
        shapes.add(quad(property, namedNode('http://www.w3.org/ns/shacl#path'), prop));
        const ranges = range.getObjects(prop, namedNode(rdfs.range), null);

        if (ranges.some((r) => r.equals(namedNode(rdfs.Literal)))) {
          shapes.add(quad(property, namedNode('http://www.w3.org/ns/shacl#nodeKind'), namedNode('http://www.w3.org/ns/shacl#Literal')));
        } else if (ranges.length === 1) {
          shapes.add(quad(property, namedNode('http://www.w3.org/ns/shacl#class'), ranges[0]));
        } else {
          // Not entirely correct but need to do it this way to work with LDO
          shapes.add(quad(property, namedNode('http://www.w3.org/ns/shacl#nodeKind'), namedNode('http://www.w3.org/ns/shacl#IRI')));
        }
      }
    }
  }

  for (const { subject, object } of shapes.match(null, namedNode('http://www.w3.org/ns/shacl#class'), null)) {
    shapes.add(quad(subject, namedNode('http://www.w3.org/ns/shacl#node'), namedNode(`${shapeBase + object.value.split('/').slice(-1)[0]}Shape`)));
  }

  fs.writeFileSync(
    path.join(__dirname, '..', 'shapes', 'odrl.shaclc'),
    await serialize(shapes, {
      contentType: 'text/shaclc',
      prefixes: {
        shacl: 'http://www.w3.org/ns/shacl#',
        odrl: 'http://www.w3.org/ns/odrl/2/',
        odrlShape: 'http://www.w3.org/ns/odrl/2/shape/',
      },
    }),
  );
  // console.log(await a.text());
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
