import { QueryEngine } from '@comunica/query-sparql';
import { AIMessageChunk } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { LocalFileCache } from 'langchain/cache/file_system';
import { StructuredOutputParser } from "langchain/output_parsers";
import { DataFactory } from 'n3';

import stringify from '@jeswr/stream-to-string';
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableWithFallbacks } from "@langchain/core/runnables";
import { OpenAI } from "@langchain/openai";
import { z } from "zod";
import path from 'path';
import dereferenceToStore from 'rdf-dereference-store';
import fs from 'fs';
import { ocd } from './ocd';
import { OCD } from './types/OCD';

const { namedNode, quad, literal, blankNode } = DataFactory;

function cost(msg: AIMessageChunk) {
    const { completionTokens, promptTokens } = msg.response_metadata.tokenUsage;
    // 4o
    // return (completionTokens * 15 + promptTokens * 5) / 10 ** 6;
    // 3.5-turbo-0125
    return (completionTokens * 1.5 + promptTokens * .5) / 10 ** 6;
}


async function pageFetch() {
    const engine = new QueryEngine();

    let i = 0;
    const record: Record<number, string> = {};
    const bindings = await engine.queryBindings('SELECT ?concept ?definition ?label ?note WHERE { ?concept a <https://w3id.org/dpv#Purpose>; <http://www.w3.org/2004/02/skos/core#definition> ?definition; <http://www.w3.org/2004/02/skos/core#prefLabel> ?label. OPTIONAL { ?concept <http://www.w3.org/2004/02/skos/core#scopeNote> ?note }  }', { sources: ['https://w3id.org/dpv#'] });
    const page = (await bindings.map(elem => (record[++i] = elem.get('concept')!.value, i) + '\t' + elem.get('definition')!.value + '\t' + elem.get('label')!.value + '\t' + elem.get('note')?.value).toArray()).join('\n');
    return { record, page };
}

const prom = pageFetch();

async function descriptionToPurposes(description: string = "Download certain Google Tools and save certain preferences, for example the number of search results per page or activation of the SafeSearch Filter. Adjusts the ads that appear in Google Search.") {
    console.log('descriptionToPurposes');
    const { record, page }: { record: Record<number, string>; page: string; } = await prom;

    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            // results: z.array(z.string().url().refine(url => options.includes(url), `Value must be one of ${JSON.stringify(options)}`)),
            explanation: z.string().describe("A precise explanation of the reasoning behind the answer. DO NOT quote the prompt in this field."),
            results: z.array(z.number().refine(num => Object.keys(record).includes(num.toString()), `Value must be one of ${JSON.stringify(Object.keys(record))}`)).describe("An array of numbers representing the line indices of the terms that apply to the description."),
            unmatchedConcepts: z.array(z.string()).optional().describe("An array of concepts in the description that were not available."),
        })
    );

    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
          "Answer the users question as best as possible.\n{format_instructions}\n{question}"
        ),
        new ChatOpenAI({
            model: 'gpt-4o',
            cache: await LocalFileCache.create('./cache'),
            // verbose: true,
        }),
        parser,
      ]);

    const fallbackChain = new RunnableWithFallbacks({
        runnable: chain,
        fallbacks: [
            chain,
            chain,
        ]
    });

    const noNamePrompt = true ? '' : "\n Make sure to use the *description* of the term, which is on the same line, in assessing its relevance and *not* the name of the term.";
      
    const response = await fallbackChain.invoke({
        question: `Following the given structure, please give a list of integers corresponding to the lines of the page that match the following description, and explain the reasoning behind the answer. Please select ALL rows that apply. If the description contains concepts that do not match the listed purposes then describe such concepts in as granular manner as possible in the unmatchedConcepts field.\"${description}\"${noNamePrompt}\n---\n${page}\n---\n.`,
        format_instructions: parser.getFormatInstructions(),
    });

    const { store } = await dereferenceToStore(path.join(__dirname, '..', 'purposes.n3'), { localFiles: true });

    console.log(response)
    const results = response.results.map((num: number) => record[num]);

    // Remove any super classes
    const minimal = results.filter(elem => !results.some(other => other !== elem && store.has(quad(namedNode(elem), namedNode('http://www.w3.org/2004/02/skos/core#broaderTransitive'), namedNode(other)))));

    return { minimal, response };
    // return [];
}

let i = 0;

async function main() {
    const descriptions: Record<string, OCD & { Purposes?: string[]; response?: Awaited<ReturnType<typeof descriptionToPurposes>>['response'] }> = await ocd();
    let promises: Promise<void>[] = [];
    
    let i = 0
    for (const key in descriptions) {
        promises.push(addResponse(descriptions, key));
        if (i++ % 20 === 0) {
            await Promise.all(promises);
        }
    }
    fs.writeFileSync('./ocd.json', JSON.stringify(descriptions, null, 2));
    // fs.writeFileSync('./purposes.json', JSON.stringify(descriptions, null, 2));
    console.log(descriptions);
}

main();


async function addResponse(descriptions: Record<string, OCD & { Purposes?: string[] | undefined; response?: { explanation: string; results: number[]; unmatchedConcepts?: string[] | undefined; } | undefined; }>, key: string) {
    const description = descriptions[key].Description;
    if (description) {
        try {
            console.log('trying...');
            const { minimal, response } = await descriptionToPurposes(description);
            descriptions[key].Purposes = minimal;
            descriptions[key].response = response;
            console.log(key, description, descriptions[key].Purposes);
        } catch (e) {
            console.warn("Failure: " + (i++) + e);
        }
    }
}
// Gets the list of DPV purposes that apply to a description.
// FUTURE: Invent terms that make use of the DPV ontology.
// descriptionToPurposes().then(console.log);
