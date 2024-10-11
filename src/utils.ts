export type ObjectValues<T> = T[keyof T]

/** NOTE: All converters work only with Base Multilingual Plane (BMP)!
 * Javascript strings represent astral planes using UTF16 surrogate pairs
 * and we do not try to restore genuine UTF32 codepoint from surrogates during conversion.
 */

/** Branded alias type for UTF8-encoded strings. */
export type Utf8String      = string
                            & { encoding?: "utf8" }

/** Branded alias type for UTF16-encoded strings. */
export type Utf16String     = string
                            & { encoding?: "utf16" }

/** Branded alias type for Base64-encoded strings. */
export type Base64String    = string
                            & { encoding?: "base64" }

/** Branded alias type for Base64Url-encoded strings. */
export type Base64UrlString = string
                            & { encoding?: "base64url" }


/**
 * Set of converters to UTF16.
 */
export class Utf16
{
    // /** Converts a UTF8 string to a UTF16 string. */
    // public static fromUtf8 = (s: Utf8String): Utf16String =>
    //     decodeURIComponent(escape(Utf8.noBom(s)))

    // /** Decodes a Base64-encoded string to a UTF16 string. */
    // public static fromBase64 = (s: Base64String): Utf16String =>
    //     Utf16.fromUtf8(Utf8.fromBase64(s))

    // /** Decodes a Base64url-encoded string to a UTF16 string. */
    // public static fromBase64Url = (s: Base64UrlString): Utf16String =>
    //     Utf16.fromUtf8(Utf8.fromBase64Url(s))

    // /** Appends Byte-Order-Mark (BOM) to the UTF16 string. */
    // public static withBom   = (s: Utf16String): Utf16String =>
    //     "\uFEFF" + s

    /** Strips a Byte-Order-Mark (BOM) from the UTF16 string. */
    public static noBom     = (s: Utf16String): Utf16String =>
        s.replace(/^\uFEFF/, "")
}

/**
 * Set of converters to UTF8.
 */
export class Utf8
{
    /** Converts a UTF16 string to a UTF8 string. */
    public static fromUtf16 = (s: Utf16String): Utf8String =>
        unescape(encodeURIComponent(Utf16.noBom(s)))

    /** Decodes a Base64-encoded string to a UTF8 string. */
    public static fromBase64 = (s: Base64String): Utf8String =>
        atob(s)

    /** Decodes a Base64url-encoded string to a UTF8 string. */
    public static fromBase64Url = (s: Base64UrlString): Utf8String =>
        Utf8.fromBase64(Base64.fromBase64Url(s))

    // /** Converts a byte array to a UTF16 string. */
    // public static fromBytes = (bytes: Uint8Array|number[]): Utf8String =>
    //     String.fromCharCode(...bytes)

    // /** Appends Byte-Order-Mark (BOM) to the UTF8 string. */
    // public static withBom = (s: Utf8String): Utf8String =>
    //   "\xEF\xBB\xBF" + s

    // /** Strips a Byte-Order-Mark (BOM) from the UTF8 string. */
    // public static noBom = (s: Utf8String): Utf8String =>
    //   s.replace(/^\xEF\xBB\xBF/, "")
}

/**
 * Set of converters to Base64.
 */
export class Base64
{
    /** Encodes a UTF8 string to a Base64-encoded string. */
    public static fromUtf8 = (s: Utf8String): Base64String =>
        btoa(s)

    /** Encodes a UTF16 string to a Base64-encoded string.  */
    public static fromUtf16 = (s: Utf16String): Base64String =>
        Base64.fromUtf8(Utf8.fromUtf16(s))

    /** Converts a Base64url-encoded string to a Base64-encoded string. */
    public static fromBase64Url = (s: Base64UrlString): Base64String =>
        ((s.length % 4 === 2) ? s + "==" :
        (s.length % 4 === 3) ? s + "=" : s)
            .replace(/-/g, "+")
            .replace(/_/g, "/")

    // /** Converts a byte array to a Base64-encoded string. */
    // public static fromBytes = (bytes: Uint8Array): Base64String =>
    //     Base64.fromUtf8(Utf8.fromBytes(bytes))

    // /** Encodes a plain JSON object or a string to a Base64-encoded string. */
    // public static fromJSON = (obj: object|string) =>
    //     Base64.fromUtf16(JSON.stringify(obj))
}

/**
 * Set of converters to Base64Url.
 */
export class Base64Url
{
    /** Converts a Base64-encoded string to a Base64url-encoded string. */
    public static fromBase64 = (s: Base64String): Base64UrlString =>
        s.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

    // /** Converts a UTF8 string to a Base64url-encoded string. */
    // public static fromUtf8 = (s: Utf8String) =>
    //     Base64Url.fromBase64(Base64.fromUtf8(s))

    /** Converts a UTF16 string to a Base64url-encoded string. */
    public static fromUtf16 = (s: Utf16String) =>
        Base64Url.fromBase64(Base64.fromUtf16(s))

    // /** Converts a byte array to a Base64url-encoded string. */
    // public static fromBytes = (bytes: Uint8Array): Base64UrlString =>
    //     Base64Url.fromUtf8(Utf8.fromBytes(bytes))

    /** Encodes a plain JSON object or a string to a Base64url-encoded string. */
    public static fromJSON = (obj: object|string) =>
        Base64Url.fromUtf16(JSON.stringify(obj))
}
