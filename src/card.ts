import { Base64UrlString } from "./utils"
import { Purpose } from "./capture"

/**@public
 */
export type CardType
    = "CID"    // Contactless ID
    | "CW"     // Contactless Writable

export type CardTechnology
    = "Proximity 125 kHz"           // Proximity 125 kHz
    | "iClass Legacy"               // iClass Legacy
    | "MIFARE Classic"              // MiFare Classic
    | "Seos"                        // SEOS
    | "MIFARE DESFire"              // DesFire EV*
    | "FeliCa Sony PaSoRi"          // Felica (from not PCSC-compatible Sony PaSoRi reades), CUID
    | "RFIdeas"                     // Cards from RFIdeas readers, CUID
    | "LEGIC"                       // Cards from not PCSC-compatible Legic readers, CUID
    | "Card Serial Number (CSN)"    // Card CUID from high frequency readers

/**@public
 * A result returned by the `capture` function in a resolved promise.
 */
export interface CaptureResult {
    readonly purpose: Purpose
    readonly cardType: CardType
    readonly tech: CardTechnology
    readonly cardData: EnrollmentData | AuthenticationData  // AuthenticationData or EnrollmentData
}

/**@public
 * The `AuthenticationData` is contained in the `CaptureResult.Data` returned for an authentication capture.
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
 * The `EnrollmentData` is contained in the `CaptureResult.Data` returned for an enrollment capture.
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
    readonly UID?: Base64UrlString      // A Base64Url encoded data blob containing the card CUID used for Contactless ID (read only) cards.
    readonly tech?: CardTechnology      // Card technology
    readonly address?: string           // Address of a DP record on iClass Legacy or MiFare Classic cards, or other necessary card information
    readonly key?: Base64UrlString      // A base64url-encoded AES256 key used for Contactless Writable cards
    nickname?: string                   // Card nickname; initially contains a card technology (same as in `tech`), but may be modified by a user
}


