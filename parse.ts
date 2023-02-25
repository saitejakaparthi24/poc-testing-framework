import { readFileSync } from "fs";
import { dependencyGraph } from './dependencyGraph'

interface RegexValidator {
  validator: RegExp;
  name: "class" | "method" | "constructor" | "dependency";
}

const primitiveTypes = new RegExp(/(string|number|boolean|null|undefined|bigint)/);

export const parseFile = (filePath: string) => {
  const contents = readFileSync(filePath, { encoding: "utf8", flag: "r" });

  const classValidator = new RegExp(/^class$/);
  const methodValidator = new RegExp(/[A-Za-z]+/);
  const constructorValidator = new RegExp(/^constructor$/);

  let contentOptimized = contents.replace(/\(/g, " ( ");
  contentOptimized = contentOptimized.replace(/\:/g, " : ");
  contentOptimized = contentOptimized.replace(/\{/g, " { ");
  contentOptimized = contentOptimized.replace(/\)/g, " ) ");
  contentOptimized = contentOptimized.replace(/\}/g, " } ");
  contentOptimized = contentOptimized.replace(/,/g, " , ");
  contentOptimized = contentOptimized.replace(/\s/g, "_");
  const contentArr = contentOptimized.split("_").filter((c) => c !== "");

  const validators: RegexValidator[] = [
    {
      validator: classValidator,
      name: "class",
    },
    {
      validator: constructorValidator,
      name: "constructor",
    },
    {
      validator: methodValidator,
      name: "method",
    },
  ];

  recursivelyValidate(contentArr, validators);
};

const recursivelyValidate = (
  contentArr: string[],
  validators: RegexValidator[],
  className=''
) => {
  if (validators.length === 0) return;

  let skipUntilIndex = 1

  for (const [idx, content] of contentArr.entries()) {
    if (
      (validators[0].validator.test(content) &&
        validators[0].name !== "method") ||
      (validators[0].validator.test(content) &&
        validators[0].name === "method" &&
        contentArr[idx + 1] === "(")
    ) {
      console.log(`\nFound a ${validators[0].name}`);
      if (validators[0].name === "class") {
        console.log(`Class name is ${contentArr[idx + 1]}`);
        skipUntilIndex = idx + 3

        // create object entry for found class
        className = contentArr[idx + 1]
        dependencyGraph[contentArr[idx + 1]] = {
          attributes: [],
          dependencies: []
        }
      } 
      else if (validators[0].name === "method") {
        const methodName = contentArr[idx]
        let closingParenthesis = contentArr.indexOf(')')
        let closingCurlyBracket = contentArr.indexOf('}') // this is deceiving
        let fullMethodStatement = contentArr.slice(idx + 1, closingParenthesis + 1)
        let parameters = fullMethodStatement.filter(s => /^((?!(\(|:|\)|,)).+)*$/.test(s))

        console.log(`Method name is ${methodName}`);

        let filteredParameters = parameters.filter((_, i) => i % 2 === 0)
        let types = parameters.filter((_, i) => i % 2 !== 0)

        console.log('\nMethod parameters are: \n')
        filteredParameters.forEach(s => console.log(s))

        console.log('\nParameter types are: \n')
        types.forEach(s => console.log(s))

        dependencyGraph[className].method = {
          name: methodName,
          parameters: []
        }

        for (let i = 0; i < types.length; i++) {
          dependencyGraph[className].method.parameters.push({
            name: filteredParameters[i],
            type: types[i]
          })
        } 

        skipUntilIndex = closingCurlyBracket + 1

      } else if (validators[0].name === "constructor") {
        let closingParenthesis = contentArr.indexOf(')')
        let closingCurlyBracket = contentArr.indexOf('}')
        let fullConstructorStatement = contentArr.slice(idx, closingParenthesis + 1)
        let dependencies = fullConstructorStatement.filter(s => /^((?!(constructor|private|public|readonly|\(|:|\)|,)).+)*$/.test(s))
        if (dependencies.length === 0) {
          console.log(`Constructor has no dependencies`);
        } else {
          let filteredDependencies = dependencies.filter((_, i) => i % 2 === 0)
          let types = dependencies.filter((_, i) => i % 2 !== 0)

          console.log('\nConstructor dependencies are: \n')
          filteredDependencies.forEach(s => console.log(s))

          console.log('\nDependencies types are: \n')
          types.forEach(s => console.log(s))
          
          for (let i = 0; i < types.length; i++) {
            if (primitiveTypes.test(types[i])) {
              dependencyGraph[className].attributes.push({
                name: filteredDependencies[i],
                type: types[i]
              })
            } else {
              dependencyGraph[className].dependencies.push({
                name: filteredDependencies[i],
                type: types[i]
              })
            }
          } 
        }

        skipUntilIndex = closingCurlyBracket + 1
      }

      break
    }
  }

  let substr = contentArr.slice(skipUntilIndex);
  recursivelyValidate(substr, validators.slice(1), className);
};
