import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import ts from "typescript";

// Mechanical Zod 4 adaptations preserve domain fields and validation rules.
const source = resolve(process.argv[2] || "../arena-gym");
const target = "packages/contracts/src";
await mkdir(target, { recursive: true });
const hashes = {};
for (const filename of (await readdir(resolve(source, "packages/shared/src")))
  .filter((name) => name.endsWith(".ts"))
  .sort()) {
  const original = await readFile(
    resolve(source, "packages/shared/src", filename),
    "utf8",
  );
  hashes[filename] = createHash("sha256").update(original).digest("hex");
  const file = ts.createSourceFile(
    filename,
    original,
    ts.ScriptTarget.Latest,
    true,
  );
  let needsPartial = false;
  const result = ts.transform(file, [
    (context) => {
      const f = context.factory;
      function visit(node) {
        node = ts.visitEachChild(node, visit, context);
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression)
        ) {
          const { expression: receiver, name } = node.expression;
          if (name.text === "partial" && node.arguments.length === 0) {
            needsPartial = true;
            return f.createCallExpression(
              f.createIdentifier("partialWithoutDefaults"),
              undefined,
              [receiver],
            );
          }
          if (name.text === "default") {
            return f.updateCallExpression(
              node,
              f.createPropertyAccessExpression(receiver, "prefault"),
              node.typeArguments,
              node.arguments,
            );
          }
          if (name.text === "innerType") {
            return f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("z"),
                "object",
              ),
              undefined,
              [f.createPropertyAccessExpression(receiver, "shape")],
            );
          }
          if (
            ts.isIdentifier(receiver) &&
            receiver.text === "z" &&
            name.text === "record" &&
            node.arguments.length === 1
          ) {
            return f.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [
                f.createCallExpression(
                  f.createPropertyAccessExpression(receiver, "string"),
                  undefined,
                  [],
                ),
                ...node.arguments,
              ],
            );
          }
        }
        if (
          ts.isTypeReferenceNode(node) &&
          ts.isQualifiedName(node.typeName) &&
          node.typeName.getText(file) === "z.ZodEffects"
        ) {
          return node.typeArguments[0];
        }
        return node;
      }
      return (node) => ts.visitNode(node, visit);
    },
  ]);
  const code = ts.createPrinter().printFile(result.transformed[0]);
  result.dispose();
  await writeFile(
    `${target}/${filename}`,
    "// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.\n" +
      (needsPartial
        ? 'import { partialWithoutDefaults } from "../compat";\n'
        : "") +
      code,
  );
}
await writeFile(
  "docs/contracts-source.json",
  JSON.stringify(
    {
      repository: "Wingital-Company/arena-gym",
      commit: execFileSync("git", ["-C", source, "rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      path: "packages/shared/src",
      adapter:
        "Zod 4: preserve partial omission, pre-parse defaults, explicit string record keys, inline refinements",
      sourceSha256: hashes,
    },
    null,
    2,
  ) + "\n",
);
