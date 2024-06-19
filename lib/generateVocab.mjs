import { Document } from "@langchain/core/documents";
import 'dotenv/config';
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import ocd from '../ocd-2.json' with { type: 'json' };
import fs from 'fs';

const proposedConcepts = {};

for (const key in ocd) {
    for (const concept of ocd[key].response?.unmatchedConcepts ?? []) {
        (proposedConcepts[concept] ??= new Set()).add(ocd[key].Description);
    }
}

for (const key in proposedConcepts) {
    proposedConcepts[key] = Array.from(proposedConcepts[key]);
}

const documents = Object.keys(proposedConcepts)
    .map((concept) => new Document({
        pageContent: concept,
    }));



console.log(documents);

fs.writeFileSync('./proposedConcepts.json', JSON.stringify(proposedConcepts, null, 2));
