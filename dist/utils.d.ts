export type ObjectValues<T> = T[keyof T];
/** NOTE: All converters work only with Base Multilingual Plane (BMP)!
 * Javascript strings represent astral planes using UTF16 surrogate pairs
 * and we do not try to restore genuine UTF32 codepoint from surrogates during conversion.
 */
/** Branded alias type for UTF8-encoded strings. */
export type Utf8String = string & {
    encoding?: "utf8";
};
/** Branded alias type for UTF16-encoded strings. */
export type Utf16String = string & {
    encoding?: "utf16";
};
/** Branded alias type for Base64-encoded strings. */
export type Base64String = string & {
    encoding?: "base64";
};
/** Branded alias type for Base64Url-encoded strings. */
export type Base64UrlString = string & {
    encoding?: "base64url";
};
/**
 * Set of converters to UTF16.
 */
export declare class Utf16 {
    /** Strips a Byte-Order-Mark (BOM) from the UTF16 string. */
    static noBom: (s: Utf16String) => Utf16String;
}
/**
 * Set of converters to UTF8.
 */
export declare class Utf8 {
    /** Converts a UTF16 string to a UTF8 string. */
    static fromUtf16: (s: Utf16String) => Utf8String;
    /** Decodes a Base64-encoded string to a UTF8 string. */
    static fromBase64: (s: Base64String) => Utf8String;
    /** Decodes a Base64url-encoded string to a UTF8 string. */
    static fromBase64Url: (s: Base64UrlString) => Utf8String;
}
/**
 * Set of converters to Base64.
 */
export declare class Base64 {
    /** Encodes a UTF8 string to a Base64-encoded string. */
    static fromUtf8: (s: Utf8String) => Base64String;
    /** Encodes a UTF16 string to a Base64-encoded string.  */
    static fromUtf16: (s: Utf16String) => Base64String;
    /** Converts a Base64url-encoded string to a Base64-encoded string. */
    static fromBase64Url: (s: Base64UrlString) => Base64String;
}
/**
 * Set of converters to Base64Url.
 */
export declare class Base64Url {
    /** Converts a Base64-encoded string to a Base64url-encoded string. */
    static fromBase64: (s: Base64String) => Base64UrlString;
    /** Converts a UTF16 string to a Base64url-encoded string. */
    static fromUtf16: (s: Utf16String) => Base64UrlString;
    /** Encodes a plain JSON object or a string to a Base64url-encoded string. */
    static fromJSON: (obj: object | string) => Base64UrlString;
}
