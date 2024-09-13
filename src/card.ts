import { Base64UrlString } from "@digitalpersona/core"

/**@public
 */
export type CardType
    = "CID"    // Contactless ID
    | "CW"     // Contactless Writable

/**@public
 * A result returned by the `capture` function in a resolved promise.
 */
export interface CaptureResult {
    readonly cardType: CardType
    readonly cardData: Base64UrlString       // AuthenticationData or EnrollmentData, base64url-encoded
}

/**@public
 * The `AuthenticationData` is base64url-encoded in the `CaptureResult.Data`.
 *
 * @example
 *  {
 *    "OTP": "837167",
 *    "UID": "BCxWcjoUkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
 *  }
 */
export interface AuthenticationData
{
    readonly UID?: Base64UrlString    // A Base64Url encoded data blob containing the card CUID used for Contactless ID (read only) cards.
    readonly OTP?: string             // A string containing the OTP value for the authentication.
}

/**@public
 * The `EnrollmentData` is base64url-encoded in the `CaptureResult.Data`.
 *
 * @example
 *  {
 *    "UID": "BCxWcjoUkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
 *    "tech":"DESFire EV",
 *    "address": 0,
 *    "key": "XVdVVUUzVVV1VVVVgwU0fww8bDOXGpF77cbXCh-nSbtEwO8aHO-wojoGcIg",
 *    "nickname":"DESFire EV"
 *  }
 */
export interface EnrollmentData
{
    readonly UID?: Base64UrlString    // A Base64Url encoded data blob containing the card CUID used for Contactless ID (read only) cards.
    readonly tech?: string            // Card technology
    readonly address?: string         // Address of a DP record on iClass Legacy or MiFare Classic cards, or other necessary card information
    readonly key?: Base64UrlString    // A base64url-encoded AES256 key used for Contactless Writable cards
    nickname?: string        // Card nickname; initially contains a card technology (same as in `tech`), but may be modified by a user
}


