// This configuration expects environment parameters passed to the rollup:
// (e.g. "rollup -c rollup.config.js --environment target:es5,format:umd,minify",
const {
    target,         // target syntax (es5, es6, ...). Default: es5
    format,         // bundle format (umd, cjs, ...). Default: umd
    npm_package_globalObject,
} = {
    target: "es5",
    format: "umd",
    standalone: false,
    ...process.env
}

export default {
    input: `dist/${target}/index.js`,
    // external: standalone ? [] : ['@digitalpersona/core'],
    output: {
        format,
        extend: true,
        name: npm_package_globalObject,
        file: `dist/${target}.bundles/index.${format}.js`,
        sourcemap: true,
    },
    plugins: [
//        nodeResolve(),  // @rollup/plugin-node-resolve
    ]
}
