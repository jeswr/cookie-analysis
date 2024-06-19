Please write a prompt for an LLM that will turn natural language descriptions of the Purpose for which the data from a browser cookie is used into a structured description using the Data Privacy Vocabulary (DPV) https://w3c.github.io/dpv/dpv/#, in particular the Purposes Fragment of the vocabulary (https://w3c.github.io/dpv/dpv/modules/purposes.html) and the Open Rights Digital Language (ODRL) https://www.w3.org/TR/odrl-model/.

The inputs that I have are (1) the name of the cookie (e.g. _ce.clock_event), (2) the category of the cookie (one of Analytics, Marketing, Functional) and (3) the description of the cookie (e.g. This cookie prevents repeated requests to the Clock API.) and I want the output to follow the following zodSchema.

```ts
const schema = z.object({
            // results: z.array(z.string().url().refine(url => options.includes(url), `Value must be one of ${JSON.stringify(options)}`)),
            explanation: z.string().describe("A precise explanation of the reasoning behind the answer. DO NOT quote the prompt in this field."),
            results: z.array(z.number().refine(num => Object.keys(record).includes(num.toString()), `Value must be one of ${JSON.stringify(Object.keys(record))}`)).describe("An array of numbers representing the line indices of the terms that apply to the description."),
            // unmatchedConcepts: z.array(z.string()).optional().describe("An array of concepts in the description that were not available."),
            unmatchedConcepts: z.array(z.object({
                name: z.string().describe(`The name of the concept that was not available e.g. \"${bindingsArray[0].get('label')}\".`),
                definition: z.string().describe(`The definition of the concept that was not available e.g. \"${bindingsArray[0].get('definition')}\".`),
                scopeNote: z.string().describe(`A description of the scope for whch the concept applies e.g. \"${bindingsArray.find(binding => binding.has('note'))?.get('note')}\".`).optional(),
                subsetOf: z.array(z.number().refine(num => Object.keys(record).includes(num.toString()), `Value must be one of ${JSON.stringify(Object.keys(record))}`)).describe("An array of numbers representing the line indices of the terms that are a superset of this concept."),
            })).describe("An array of concepts in the description that were not available - these should NOT be tied to a particular product."),
        })
```

The prompt I was initially using was the following f-string

```txt
Following the given structure, please give a list of integers corresponding to the lines of the page that match the following description, and explain the reasoning behind the answer. Please select ALL rows that apply. If the description contains concepts that do not match the listed purposes then describe such concepts in as granular manner as possible in the unmatchedConcepts field. name: \"{name}\" category: "{category}\" description: \"${description}\" \n---\n{page}\n---\n.
```

Please wait for me to send the next message where I will include the contents of the page variable. Then ask me any questions you need to help write the best possible prompt for this task:
