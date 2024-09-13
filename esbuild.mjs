import * as esbuild from "esbuild"
import { createRequire, builtinModules } from "module"

const require = createRequire(import.meta.url)
const pkg = require('./package.json');

await esbuild.build({
    format: "esm",
    bundle: true,
    minify: false,
    external: [
        ...builtinModules,
        ...Object.keys(pkg.peerDependencies || {})
    ],
    entryPoints: ["src/index.ts"],
    outfile: `dist/index.js`
})
