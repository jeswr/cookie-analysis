import { pageFetch } from "./pageFetch";
import * as fs from "fs";

pageFetch().then(({ record, page, bindingsArray }) => {
    fs.writeFileSync('./purposes.tsv', page);
});
