// Use [Astrea](https://github.com/oeg-upm/astrea) to generated shapes based on
// the ODRL ontology.
import dereference from 'rdf-dereference-store';
import serialize from '@jeswr/rdf-serialize-store';
import * as fs from 'fs';
import * as path from 'path';

async function shapeFromOnotology(ontology: string) {
  return dereference(`https://shacl-play.sparna.fr/play/generate?url=${ontology}&format=Turtle`);
}

async function main() {
  const { prefixes: odrlPrefixes } = await dereference('https://www.w3.org/ns/odrl/2/ODRL22.ttl');
  const { store, prefixes } = await shapeFromOnotology('https://www.w3.org/ns/odrl/2/ODRL22.ttl');
  fs.writeFileSync(
    path.join(__dirname, '..', 'shapes', 'sparnaOdrl.shce'),
    await serialize(store, {
      contentType: 'text/shaclc-ext',
      prefixes: { ...prefixes, ...odrlPrefixes },
    }),
  );
  console.log(store.size);
}

main();
