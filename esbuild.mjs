//import pkg from "./package.json" with { type: "json" };
import * as esbuild from "esbuild"

const baseConifg = {
    bundle: true,
    sourcemap: true,
    entryPoints: ["src/index.ts"],
    globalName: 'dp.card',
    external: [
        "WebSdk"
    ],
 }

await esbuild.build({
    ...baseConifg,
    format: "esm",
    target: [ "esnext" ],
    minify: false,
    outfile: "dist/index.mjs",
})

await esbuild.build({
    ...baseConifg,
    format: "iife",
    target: [ "es2015" ],
    minify: false,
    outfile: "dist/index.js",
})

await esbuild.build({
    ...baseConifg,
    format: "iife",
    target: [ "es2015" ],
    minify: true,
    outfile: `dist/index.min.js`,
})
