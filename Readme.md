# HID DigitalPersona Card API

This JavaScript library allows to use card readers in web browsers and capture card enrollment or authentication data, using a DigitalPersona local device access API.

The API requires either [HID DigitalPersona Workstation](https://www.hidglobal.com/product-mix/digitalpersona) or [HID Authentication Device Client ](https://digitalpersona.hidglobal.com/lite-client/) (previously "Lite Client") to be installed on the user machine (Microsoft Windows only). This software provides communication between we browser and the native card API/drivers.

Supported card technologies:

* Proximity 125 kHz
* iClass Legacy
* MiFare Classic
* SEOS
* DesFire EV*
* Felica (from not PCSC-compatible Sony PaSoRi reades), CUID
* Cards from RFIdeas readers, CUID
* Cards from not PCSC-compatible Legic readers, CUID
* Card CUID from high frequency readers

Supported browsers:

* Chrome and Chrome-based browsers (Edge etc)
* Firefox
* Edge Legacy (WebView2)

Module formats (browser-only, no NodeJS!):

* modern ESM (ESNext): `dist/index.mjs`
* IIFE (ES2015): `dist/index[.min].js`
* Typings (TypeScript): `dist/@types`

## Documentation

[Usage information and API description](https://github.com/hidglobal/digitalpersona-card/blob/master/docs/usage/index.adoc)

[Code samples](https://github.com/hidglobal/digitalpersona-card/tree/master/samples)

[Information for contributors/maintainers](https://github.com/hidglobal/digitalpersona-card/blob/master/docs/maintain/index.adoc)

## License

The library is licensed under the [MIT](./LICENSE) license. Copyright (c) 2025 HID Global, Inc.

