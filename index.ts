import { readdirSync } from "fs";
import { parseFile } from "./parse";

const readRecursively = (currentPath: string) => {
  try {
    const fileName = readdirSync(`${__dirname}${currentPath}`);

    fileName.map((file) => {
      if (
        !file.includes(".map") &&
        !file.includes(".spec") &&
        file !== "parse.js" &&
        currentPath !== '' &&
        file.substring(file.length - 3, file.length) === ".js"
      )
        parseFile(`${__dirname}${currentPath}/${file}`);
      readRecursively(`${currentPath}/${file}`);
    });
  } catch (err) {
    return;
  }
};

readRecursively("");
