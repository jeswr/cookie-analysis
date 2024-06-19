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
import {  } from "@inrupt/solid-client-authn-core/";
import { pageFetch } from './pageFetch';

const { namedNode, quad, literal, blankNode } = DataFactory;

function cost(msg: AIMessageChunk) {
    const { completionTokens, promptTokens } = msg.response_metadata.tokenUsage;
    // 4o
    // return (completionTokens * 15 + promptTokens * 5) / 10 ** 6;
    // 3.5-turbo-0125
    return (completionTokens * 1.5 + promptTokens * .5) / 10 ** 6;
}


const prom = pageFetch();

async function descriptionToPurposes({ Description, Category }: OCD, key: string) {
    console.log('descriptionToPurposes');
    const { record, page, bindingsArray } = await prom;

    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            // results: z.array(z.string().url().refine(url => options.includes(url), `Value must be one of ${JSON.stringify(options)}`)),
            explanation: z.string().describe("A precise explanation of the reasoning behind the answer. DO NOT quote the prompt in this field."),
            results: z.array(z.number().refine(num => Object.keys(record).includes(num.toString()), `Value must be one of ${JSON.stringify(Object.keys(record))}`)).describe("An array of numbers representing the line indices of the terms that apply to the description."),
            // unmatchedConcepts: z.array(z.string()).optional().describe("An array of concepts in the description that were not available."),
            unmatchedConcepts: z.array(z.object({
                name: z.string().describe(`The name of the concept that was not available e.g. \"${bindingsArray[0].get('label')}\".`),
                definition: z.string().describe(`The definition of the concept that was not available e.g. \"${bindingsArray[0].get('definition')}\".`),
                scopeNote: z.string().describe(`A description of the scope for whch the concept applies e.g. \"${bindingsArray.find(binding => binding.has('note'))?.get('note')}\".`).optional(),
                subsetOf: z.array(z.number().refine(num => Object.keys(record).includes(num.toString()), `Value must be one of ${JSON.stringify(Object.keys(record))}`)).describe("An array of numbers representing the line indices of the terms that are a superset of this concept."),
            })).describe("An array of concepts in the description that were not available - these should NOT be tied to a particular product. If the concept is a refinedment of another concept please still add it here, provide the line indices of the superset concepts. For instance if the description is \"Cookie consent system cookie for storing the level of cookie consent.\" then one of the unmatchedConcepts would be {name: \"Cookie consent system cookie\", definition: \"A cookie for storing the level of cookie consent.\", subsetOf: [37]}."),
        })
    );

    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            fs.readFileSync(path.join(__dirname, '..', 'prompts', 'datav2.fstring'), 'utf-8').toString()
        //   "Answer the users question as best as possible.\n{format_instructions}\n{question}"
        ),
        new ChatOpenAI({
            model: 'gpt-4o',
            cache: await LocalFileCache.create('./cache'),
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
        name: key,
        category: Category,
        description: Description,
        purposes: page,
        // question: `Following the given structure, please give a list of integers corresponding to the lines of the page that match the following description, and explain the reasoning behind the answer. Please select ALL rows that apply. If the description contains concepts that do not match the listed purposes then describe such concepts in as granular manner as possible in the unmatchedConcepts field. \"${description}\" \"${description}\" ${noNamePrompt}\n---\n${page}\n---\n.`,
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
    const keys = [];
    
    let i = 0
    for (const key in descriptions) {
        if (i > 40) break;
        promises.push(addResponse(descriptions, key));
        keys.push(key);
        if (i++ % 20 === 0) {
            await Promise.all(promises);
        }
    }
    await Promise.all(promises);
    fs.writeFileSync('./ocd-2.json', JSON.stringify(descriptions, null, 2));
    // fs.writeFileSync('./purposes.json', JSON.stringify(descriptions, null, 2));
    console.log(keys.map(key => descriptions[key]));
}

main();


async function addResponse(descriptions: Record<string, OCD & { Purposes?: string[] | undefined; response?: Awaited<ReturnType<typeof descriptionToPurposes>>['response'] | undefined; }>, key: string) {
    const description = descriptions[key].Description;
    if (description) {
        try {
            console.log('trying...');
            const { minimal, response } = await descriptionToPurposes(descriptions[key], key);
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
