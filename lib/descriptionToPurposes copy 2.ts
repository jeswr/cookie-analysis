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

const engine = new QueryEngine();

async function descriptionToPurposes(description: string = "Download certain Google Tools and save certain preferences, for example the number of search results per page or activation of the SafeSearch Filter. Adjusts the ads that appear in Google Search.") {
    
    const bindings = await engine.query('SELECT ?concept ?definition ?label ?note WHERE { ?concept a <https://w3id.org/dpv#Purpose>; <http://www.w3.org/2004/02/skos/core#definition> ?definition; <http://www.w3.org/2004/02/skos/core#prefLabel> ?label. OPTIONAL { ?concept <http://www.w3.org/2004/02/skos/core#scopeNode> ?note }  }', { sources: ['https://w3id.org/dpv#'] });
    const string = await stringify((await engine.resultToString(bindings, 'text/tab-separated-values')).data);

    const bindingsStream = await engine.queryBindings('SELECT ?concept WHERE { ?concept a <https://w3id.org/dpv#Purpose>  }', { sources: ['https://w3id.org/dpv#'] });
    const options = await bindingsStream.map(elem => elem.get('concept')!.value).toArray();

    const parser = StructuredOutputParser.fromZodSchema(z.array(z.string().url()));

    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
          "Answer the users question as best as possible.\n{format_instructions}\n{question}"
        ),
        new ChatOpenAI({
            model: 'gpt-4o',
            cache: await LocalFileCache.create('./cache'),
        }),
        StructuredOutputParser.fromZodSchema(
            z.object({
                results: z.array(z.string().url().refine(url => options.includes(url), `Value must be one of ${JSON.stringify(options)}`)),
                explanation: z.string(),
            })
        ),
      ]);

    const fallbackChain = new RunnableWithFallbacks({
        runnable: chain,
        fallbacks: [
            chain,
            chain,
        ]
    });

    const noNamePrompt = "\n Make sure to use the *description* of the term, which is on the same line, in assessing its relevance and *not* the name of the term.";
      
    const response = await fallbackChain.invoke({
        question: `Which of the terms in the below document apply to the description \"${description}\"${noNamePrompt}\n---\n${string}\n---\n.`,
        format_instructions: parser.getFormatInstructions(),
    });

    const { store } = await dereferenceToStore(path.join(__dirname, '..', 'purposes.n3'), { localFiles: true });

    // Remove any super classes
    const minimal = response.results.filter(elem => !response.results.some(other => other !== elem && store.has(quad(namedNode(elem), namedNode('http://www.w3.org/2004/02/skos/core#broaderTransitive'), namedNode(other)))));

    return minimal;
    // return [];
}

let i = 0;

async function main() {
    const descriptions: Record<string, OCD & { Purposes?: string[] }> = await ocd();
    for (const key in descriptions) {
        i += 1;
        if (i > 5) {
            process.exit();
        }
        const description = descriptions[key].Description;
        if (description) {
            try {
                descriptions[key].Purposes = await descriptionToPurposes(description);
                console.log(key, description, descriptions[key].Purposes);
            } catch (e) {
                console.warn("Failure: " + (i++));
            }
        }
    }
    fs.writeFileSync('./purposes.json', JSON.stringify(descriptions, null, 2));
    console.log(descriptions);
}

main();

// Gets the list of DPV purposes that apply to a description.
// FUTURE: Invent terms that make use of the DPV ontology.
// descriptionToPurposes().then(console.log);
