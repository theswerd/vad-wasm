

const libfvadjs = Deno.readTextFileSync("./out/libfvad.js");

// patch module + process
const patched = libfvadjs.replace(
    "import { createRequire } from 'module';",
    `/* Injected by monkey-patch.ts */
import { createRequire } from 'node:module';
import process from 'node:process';
/* Injected by monkey-patch.ts */
    `
)

// save patched module
Deno.writeTextFileSync("./out/libfvad.js", patched);