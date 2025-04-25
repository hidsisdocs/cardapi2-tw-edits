# HID DigitalPersona Card API v1

This JavaScript library allows to use card readers in web browsers 
and capture card enrollment or authentication data, using a DigitalPersona local device access API.

> [!WARNING]
> **This v1 API is deprecated!** For new applications, please use the
latest v2 API which provides a simpler async interface instead of the
event-based one, and adds support of mmobile devicess for authentication factors.

> [!IMPORTANT]
> The API is designed to be used in a browser environment only!
This is not a NodeJS library!

## Requirements

The Card API requires one of following HID DigitalPersona clients to be installed
ont the user's machine:

* [HID DigitalPersona Workstation / Kiosk](https://www.hidglobal.com/product-mix/digitalpersona) -- part of HID DigitalPersona Premium suite, providing multi-factor authentication, biometrics, integration with Active Directory, etc.
* [HID Authentication Device Client ](https://digitalpersona.hidglobal.com/lite-client/) (previously "Lite Client") -- a free Windows client, providing 
communication with devices like fingerprint readers, cards etc.

## Target platforms and technologies

Supported platforms:

* Windows 10 and later
* Windows Server 2008 R2 and later

Supported browsers:

* Chrome and Chrome-based browsers (Edge etc)
* Firefox
* Edge Legacy (WebView2)

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

Module formats (browser-only, no NodeJS!):

* IIFE (ES5): `dist/card.sdk[.min].js`
* Typings (TypeScript): `dist/card.sdk.d.ts

## Documentation

[Usage information and API description](https://github.com/hidglobal/digitalpersona-card/blob/v1/docs/usage/index.adoc)

[Code samples](https://github.com/hidglobal/digitalpersona-card/tree/v1/samples)

[Information for contributors/maintainers](https://github.com/hidglobal/digitalpersona-card/blob/v1/docs/maintain/index.adoc)

## License

The library is licensed under the [MIT](./LICENSE) license.

Copyright (c) 2025 HID Global, Inc.

