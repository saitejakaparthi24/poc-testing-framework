// Import necessary libraries and types
import {
  Project,
  ClassDeclaration,
  ConstructorDeclaration,
  MethodDeclaration,
  MethodSignature,
  SyntaxKind,
} from "ts-morph";
import * as graphviz from "graphviz";
import * as fs from "fs";

// Define the function to generate the control flow graph
function generateControlFlowGraph(srcDir: string, outputFile: string) {
  // Create a new ts-morph Project
  const project = new Project();
  // Add source files to the project
  project.addSourceFilesAtPaths(`${srcDir}/**/*.ts`);

  // Create a new directed graph using the graphviz library
  const g = graphviz.digraph("G");
  // Get the type checker from the project
  const typeChecker = project.getTypeChecker();

  // Iterate over each source file in the project
  project.getSourceFiles().forEach((sourceFile) => {
    // Iterate over each class declaration in the source file
    sourceFile.getClasses().forEach((classDeclaration) => {
      const className = classDeclaration.getName() || "AnonymousClass";
      // Iterate over each method in the class declaration
      classDeclaration.getMethods().forEach((method) => {
        const methodName = method.getName();
        const fromNodeName = `${className}_${methodName}`;
        // Add a node to the graph for the current method
        g.addNode(fromNodeName, { label: `${className}.${methodName}()` });

        // Iterate over each descendant node in the method's AST
        method.getDescendants().forEach((descendant) => {
          // Check if the descendant is a CallExpression
          if (descendant.getKindName() === "CallExpression") {
            const callExpr = descendant as import("ts-morph").CallExpression;
            const signature = typeChecker.getResolvedSignature(callExpr);
            if (signature) {
              const signatureDeclaration = signature.getDeclaration();
              const signatureParent = signatureDeclaration.getParentOrThrow();

              // Determine the parent name based on the signature parent type
              let signatureParentName: string;
              if (signatureParent instanceof ClassDeclaration) {
                signatureParentName = signatureParent.getName() || "AnonymousParent";
              } else if (signatureParent instanceof ConstructorDeclaration) {
                const constructorParent = signatureParent.getParentIfKindOrThrow(
                  SyntaxKind.ClassDeclaration
                );
                signatureParentName = constructorParent.getName() || "AnonymousParent";
              } else {
                signatureParentName = "UnknownParent";
              }

              // Determine the method/constructor name based on the signature declaration type
              let signatureDeclarationName: string;
              if (signatureDeclaration instanceof MethodDeclaration || signatureDeclaration instanceof MethodSignature) {
                signatureDeclarationName = signatureDeclaration.getName();
              } else if (signatureDeclaration instanceof ConstructorDeclaration) {
                signatureDeclarationName = "constructor";
              } else {
                signatureDeclarationName = "UnknownMethod";
              }

              const toNodeName = `${signatureParentName}_${signatureDeclarationName}`;

              // If there is a valid target node name, add the node and edge to the graph
              if (toNodeName) {
                g.addNode(toNodeName, { label: `${signatureParentName}.${signatureDeclarationName}()` });
                g.addEdge(fromNodeName, toNodeName);
              }
            }
          }
        });
      });
    });
  });

  // Write the graph to a .dot file
  fs.writeFileSync(outputFile, g.to_dot(), "utf-8");
}

// Update the source directory and output .dot file path as needed
const srcDir = "./src";
const outputFile = "./CFG.dot";
generateControlFlowGraph(srcDir, outputFile);
