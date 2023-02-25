import { readFileSync } from "fs";

interface RegexValidator {
  validator: RegExp;
  name: 'class' | 'method' | 'constructor' | 'dependency';
}

export const parseFile = (filePath: string) => {
  const contents = readFileSync(filePath, { encoding: "utf8", flag: "r" });

  const classValidator = new RegExp(/class/);
  const methodValidator = new RegExp(/[A-Za-z]\(/);
  const constructorValidator = new RegExp(/constructor\(/);

  const contentArr = contents.split(" ");

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
  validators: RegexValidator[]
) => {
  if (validators.length === 0) return

  for (const [idx, content] of contentArr.entries()) {
    if (validators[0].validator.test(content)) {
      console.log(`Found a ${validators[0].name}`);
      if (validators[0].name === 'class')
        console.log(`Class name is ${contentArr[idx + 1]}`);

      else if (validators[0].name === 'method') {
        const methodName = contentArr[idx].substring(0, contentArr[idx].indexOf('('))
        console.log(`Method name is ${methodName}`);
      }

      else if (validators[0].name === 'constructor') {
        let dependencies = contentArr[idx].slice(12, contentArr[idx].length - 1)
        if (dependencies.length === 0) {
          console.log(`Constructor has no dependencies`);
        } else {
          console.log(`Constructor dependencies are ${dependencies}`);
        }
      }

      let substr = contentArr.slice(idx + 2);
      recursivelyValidate(substr, validators.slice(1));
    }
  }
};
