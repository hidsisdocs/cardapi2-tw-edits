# DigitalPersona Card API examples

The `./samples` folder contains several examples of using the Card API.

To build and run each sample, run:

```
cd .\samples\<sample folder>
npm install
npm start
```

This command will run am HTTTP server in the current terminal, serving the sample site and opening it in a default browser.
To stop the server, press `Ctrl-C`.

## `vanilla` - using an UMD module in vanilla JS

This sample demostrates how to use Card API using a UMD ("Universal Module Definition") format, with no bundling.

The `index.html` uses `<script>` tags to load

1. the `WebSdk` module (`./dist/websdk.client.ui.js`, copied from the `.\node_modules\@digitalpersona\websdk\dist\`), then
2. Card API UMD module (`./dist/index.umd.js` copied from the `.\node_modules\@digitalpersona\card\dist\es6.bundles\`), then
3. the main `index.js` (an ESM module).

The Card API UMD module, being loaded via a `<script>` tag, exports its functions using a global object `dp.card`, so the main `index.js` just uses this global object:

```js
const { capture } = dp.card;

...
```

NOTE: the `WebSdk` v1.0 canot be bundled! Do not attempt to bundle it, instead load it unmodified using the `<script>` tag.
The build script copies WebSdk into the `./dist` folder (`./dist/websdk.client.ui.js`) from the `.\node_modules\@digitalpersona\websdk\dist\`.

## `angular` - using Typescript and ESM module, `Angular` and `Webpack`

This sample demostrates how to use Card API using a ESM format, Angular component and `Webpack` as a bundler.

The `index.html` uses `<script>` tags to load

1. the `WebSdk` module (`./dist/websdk.client.ui.js`, copied from the `.\node_modules\@digitalpersona\websdk\dist\`), then
2. the main bundle

The Card API ESM module is imported using the reguar ES6 `import`:

```js
import { capture } from "@digitalpersona/card"

...
```

