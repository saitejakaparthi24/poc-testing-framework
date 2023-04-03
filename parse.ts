import { readFileSync, writeFileSync } from "fs";
import { ClassFormat, dependencyGraph } from "./dependencyGraph";

interface RegexValidator {
  validator: RegExp;
  name:
    | "class"
    | "method"
    | "constructor"
    | "dependency"
    | "conditional-flow"
    | "generic-statement";
}

const primitiveTypes = new RegExp(
  /(string|number|boolean|null|undefined|bigint)/
);

const conditionalOperators = new RegExp(/(===|<|>|<=|>=|!==)/);

const methodValidators: RegexValidator[] = [
  {
    validator: /(^if$|^else$)/,
    name: "conditional-flow",
  },
  {
    validator: /^(return|break|continue)$/,
    name: "generic-statement",
  },
  // add validators for more control flow statements, and other constructs you can think of
];

const testCases: string[] = [];
let filePathName: string;
let fileName: string;

export const parseFile = (filePath: string) => {
  const contents = readFileSync(filePath, { encoding: "utf8", flag: "r" });

  let filePathArr = filePath.split("/");
  fileName = filePathArr.pop();
  filePathName = filePathArr.join("/");

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
  className = ""
) => {
  if (validators.length === 0) return;

  let skipUntilIndex = 1;

  for (const [idx, content] of contentArr.entries()) {
    if (
      (validators[0].validator.test(content) &&
        validators[0].name !== "method") ||
      (validators[0].validator.test(content) &&
        validators[0].name === "method" &&
        contentArr[idx + 1] === "(")
    ) {
      if (validators[0].name === "class") {
        console.log(`\n======================================`);
        console.log(`\tClass name: ${contentArr[idx + 1]}`);
        console.log(`======================================`);

        skipUntilIndex = idx + 3;

        // create object entry for found class
        className = contentArr[idx + 1];
        dependencyGraph[contentArr[idx + 1]] = {
          attributes: [],
          dependencies: [],
        };
      } else if (validators[0].name === "method") {
        const methodName = contentArr[idx];
        let closingParenthesis = contentArr.indexOf(")");
        let openingCurlyBracket = contentArr.indexOf("{"); // this is deceiving

        let closingCurlyBracket = contentArr.indexOf("}"); // this is deceiving
        let fullMethodStatement = contentArr.slice(
          idx + 1,
          closingParenthesis + 1
        );
        let parameters = fullMethodStatement.filter((s) =>
          /^((?!(\(|:|\)|,)).+)*$/.test(s)
        );

        console.log("----------------------------");
        console.log(`Method name: ${methodName}`);
        console.log("----------------------------");

        let filteredParameters = parameters.filter((_, i) => i % 2 === 0);
        let types = parameters.filter((_, i) => i % 2 !== 0);

        console.log("Method parameters:");
        filteredParameters.forEach((s) => console.log(`  - ${s}:`));
        console.log("");

        console.log("Parameter types:");
        types.forEach((s) => console.log(`  - ${s}`));

        dependencyGraph[className].method = {
          name: methodName,
          parameters: [],
        };

        for (let i = 0; i < types.length; i++) {
          dependencyGraph[className].method.parameters.push({
            name: filteredParameters[i],
            type: types[i],
          });
        }

        parseMethodBody(
          methodName,
          methodValidators,
          contentArr.slice(openingCurlyBracket + 1),
          className
        );

        skipUntilIndex = closingCurlyBracket + 1;
      } else if (validators[0].name === "constructor") {
        let closingParenthesis = contentArr.indexOf(")");
        let closingCurlyBracket = contentArr.indexOf("}");
        let fullConstructorStatement = contentArr.slice(
          idx,
          closingParenthesis + 1
        );
        let dependencies = fullConstructorStatement.filter((s) =>
          /^((?!(constructor|private|public|readonly|\(|:|\)|,)).+)*$/.test(s)
        );
        if (dependencies.length === 0) {
          console.log(`Constructor has no dependencies`);
        } else {
          let filteredDependencies = dependencies.filter((_, i) => i % 2 === 0);
          let types = dependencies.filter((_, i) => i % 2 !== 0);

          console.log("Constructor dependencies:");
          filteredDependencies.forEach((s) => console.log(`  - ${s}`));
          console.log("");

          console.log("Dependencies types:");
          types.forEach((s) => console.log(`  - ${s}`));
          console.log("");

          for (let i = 0; i < types.length; i++) {
            if (primitiveTypes.test(types[i])) {
              dependencyGraph[className].attributes.push({
                name: filteredDependencies[i],
                type: types[i],
              });
            } else {
              dependencyGraph[className].dependencies.push({
                name: filteredDependencies[i],
                type: types[i],
              });
            }
          }
        }

        skipUntilIndex = closingCurlyBracket + 1;
      }

      break;
    }
  }

  let substr = contentArr.slice(skipUntilIndex);
  recursivelyValidate(substr, validators.slice(1), className);

  createTestFile(className, dependencyGraph[className]);
};

const parseMethodBody = (
  methodName: string,
  validators: RegexValidator[],
  contentArr: string[],
  className: string
) => {
  let assertionSubject: any;
  let assertionValue: any;
  let comparisonOperand: string;

  for (let idx = 0; idx < contentArr.length; idx++) {
    for (let i = 0; i < validators.length; i++) {
      if (validators[i].validator.test(contentArr[idx])) {
        if (validators[i].name === "conditional-flow") {
          console.log(`\n================================================`);
          console.log(`\tMethod construct: ${validators[i].name}`);
          console.log(`================================================`);

          if (contentArr[idx] === "if") {
            let closingParenthesis = contentArr.indexOf(")");
            let openingCurlyBracket = contentArr.indexOf("{");

            let fullIfControlStatement = contentArr.slice(
              idx + 2,
              closingParenthesis
            );

            let isAssertionSubject = true;

            for (let j = 0; j < fullIfControlStatement.length; j++) {
              if (!conditionalOperators.test(fullIfControlStatement[j])) {
                if (isAssertionSubject) {
                  if (/this.*/.test(fullIfControlStatement[j])) {
                    assertionSubject = fullIfControlStatement[j].replace(
                      /this./,
                      ""
                    );
                  }
                } else {
                  assertionValue = fullIfControlStatement[j];
                }
              } else {
                comparisonOperand = fullIfControlStatement[j];
                isAssertionSubject = !isAssertionSubject;
              }
            }

            idx = openingCurlyBracket;
          } else if (contentArr[idx] === "else") {
            switch (comparisonOperand) {
              case "===":
                comparisonOperand = "!==";
                break;
              default:
                break;
            }

            idx += 1;
          }
        } else if (validators[i].name === "generic-statement") {
          switch (contentArr[idx]) {
            case "return": {
              const openingBackTick = idx + 1;
              let closingBackTick: number;

              const contentCopy = contentArr.slice(openingBackTick + 1);
              for (let k = 0; k < contentCopy.length; k++) {
                if (contentCopy[k].replace(/((?!(`)).)+/, "") === "`") {
                  closingBackTick = openingBackTick + k + 1;
                  break;
                }
              }

              const fullReturnStatement = contentArr.slice(
                openingBackTick,
                closingBackTick + 1
              );
              let output = fullReturnStatement.join("").replace(/this./, "");
              createTestCase(
                assertionSubject,
                assertionValue.slice(1, -1),
                comparisonOperand,
                dependencyGraph[className],
                output
              );
              idx = closingBackTick + 1;
            }
            default:
              break;
          }
        }
        break;
      }
    }
  }
};

const createTestCase = (
  assertionSubject: any,
  assertionValue: any,
  comparisonOperand: string,
  entity: ClassFormat,
  output: any
) => {
  const methodInput = entity.method.parameters
    .map((parameter) => parameter.name)
    .join(",");
  const attributes = entity.attributes
    .map((attribute) => {
      if (assertionSubject === attribute.name && comparisonOperand === "===") {
        return `'${assertionValue}'`;
      }
      return attribute.name;
    })
    .join(",");

  let { verb1, verb2 } = operandToString(comparisonOperand);

  testCases.push(`\ttest('ensure ${entity.method.name} method ${verb1} a ${assertionValue} related value if ${assertionSubject} ${verb2} ${assertionValue}', async () => {
    const { sut } = makeSut(${attributes})
    let result = sut.${entity.method.name}(${methodInput})

    expect(result).toBe(${output})
  })\n\n`);
};

const createTestFile = (className: string, entity: ClassFormat) => {
  const parameters = entity.attributes
    .map((attribute) => attribute.name + ": " + attribute.type)
    .join(",");
  const attributes = entity.attributes
    .map((attribute) => attribute.name)
    .join(",");
  const methodInputs = entity.method.parameters
    .map((parameter) => parameter.name)
    .join(",");

  let globalConstants = "";
  attributes.split(",").forEach((attr) => {
    globalConstants += `\tconst ${attr} = 'any_${attr}'\n`;
  });
  methodInputs.split(",").forEach((methodInput) => {
    globalConstants += `\tconst ${methodInput} = 'any_${methodInput}'\n`;
  });

  const file = fileName.split(".");

  const testFile = `import { ${className} } from './${file[0]}'\n
const makeSut = (${parameters}): { sut: ${className}} => {
\treturn { sut: new ${className}(${attributes}) }
}\n
describe('${className} class', () => {
${globalConstants}
${testCases}\n
})`;

  try {
    writeFileSync(`${filePathName}/${file[0]}.spec.ts`, testFile);
  } catch (err) {
    console.error(err);
  }
};

const operandToString = (
  comparisonOperand: string
): { verb1: string; verb2: string } => {
  switch (comparisonOperand) {
    case "===":
      return { verb1: "returns", verb2: "is" };
    case "!==":
      return { verb1: "does not return", verb2: "is not" };
    default:
      break;
  }
};
