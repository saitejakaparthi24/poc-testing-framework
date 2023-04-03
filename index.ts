import { readdirSync } from "fs";
import  { execSync } from 'child_process';

import { dependencyGraph } from "./dependencyGraph";
import { parseFile } from "./parse";

const regexValidator = new RegExp(
  /^((?!(node_modules|dist|\.vscode|\.git|\.gitignore|package-lock\.json|package\.json|parse\.ts|README\.md|tsconfig\.json|dependencyGraph\.ts)).)+/
);

const sourceFileValidator = new RegExp(/^((?!([a-zA-Z]*\.(js|map|spec|test))).)+/)

const readRecursively = (currentPath: string) => {
  try {
    const path = `${__dirname}${currentPath}`;

    const fileName = readdirSync(path);

    fileName.map((file) => {
      if (
        sourceFileValidator.test(file) &&
        currentPath !== "" &&
        file.substring(file.length - 3, file.length) === ".ts"
      )
        parseFile(`${path}/${file}`);
      if (regexValidator.test(file) && sourceFileValidator.test(file))
        readRecursively(`${currentPath}/${file}`);
    });
  } catch (err) {
    return;
  }
};

readRecursively("");

console.log('\nDependency grahp: ', JSON.stringify(dependencyGraph, null, 2))

console.log('\nRunning test cases...')
execSync('npm run test')