import { Base64UrlString } from "./utils";
import { Purpose } from "./capture";
/**@public
 */
export type CardType = "CID" | "CW";
export type CardTechnology = "Proximity 125 kHz" | "iClass Legacy" | "MIFARE Classic" | "Seos" | "MIFARE DESFire" | "FeliCa Sony PaSoRi" | "RFIdeas" | "LEGIC" | "Card Serial Number (CSN)";
/**@public
 * A result returned by the `capture` function in a resolved promise.
 */
export interface CaptureResult {
    readonly purpose: Purpose;
    readonly cardType: CardType;
    readonly tech: CardTechnology;
    readonly cardData: EnrollmentData | AuthenticationData;
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
export interface AuthenticationData {
    readonly UID?: Base64UrlString;
    readonly OTP?: string;
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
export interface EnrollmentData {
    readonly UID?: Base64UrlString;
    readonly tech?: CardTechnology;
    readonly address?: string;
    readonly key?: Base64UrlString;
    nickname?: string;
}
