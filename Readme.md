# HID DigitalPersona Card API

This JavaScript library enables the use of card readers in web browsers, allowing to capture card enrollment or authentication data using a DigitalPersona local device access API.

## Requirements

The Card API requires one of the following HID DigitalPersona clients to be installed on the user's machine to provide communication between the browser and the native card API/drivers:
* [HID DigitalPersona Workstation ](https://www.hidglobal.com/product-mix/digitalpersona) - part of HID DigitalPersona Premium suite, providing multi-factor authentication, biometrics, integration with Microsoft® Active Directory, etc
* [HID Authentication Device Client ](https://digitalpersona.hidglobal.com/lite-client/) (ADC, previously Lite Client) - a free Microsoft Windows® client providing communication with devices such as fingerprint readers and cards
<!--- SIS: add Kiosk? --->

## Target platforms and technologies

Supported platforms:
* Microsoft Windows 10 and later
* Microsoft Windows Server 2008 R2 and later

Supported browsers:
* Google® Chrome®  and Chrome-based browsers (such as Microsoft Edge)
* Mozilla® Firefox®
* Microsoft Edge Legacy (WebView2)

Supported card technologies:

* Proximity 125 kHz
* iClass Legacy
* MiFare Classic
* SEOS
* DesFire EV*
* Felica (from not PCSC-compatible Sony PaSoRi readers), CUID
* Cards from RFIdeas readers, CUID
* Cards from not PCSC-compatible Legic readers, CUID
* Card CUID from high frequency readers

Module formats (browser-only, no NodeJS!):

* Modern ESM (ESNext) - `dist/index.mjs`
* IIFE (ES2015) - `dist/index[.min].js`
* Typings (TypeScript) - `dist/@types`

## Documentation

[Usage information and API description](https://github.com/hidglobal/digitalpersona-card/blob/master/docs/usage/index.adoc)

[Code samples](https://github.com/hidglobal/digitalpersona-card/tree/master/samples)

[Information for contributors/maintainers](https://github.com/hidglobal/digitalpersona-card/blob/master/docs/maintain/index.adoc)

## License

The library is licensed under the [MIT](./LICENSE) license. Copyright (c) 2025 HID Global, Inc.

