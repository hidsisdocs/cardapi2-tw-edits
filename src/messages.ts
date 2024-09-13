import { Base64Url, Base64UrlString } from "@digitalpersona/core"
import { ObjectValues } from "./utils"
import { CaptureResult } from "./card"

/**@internal
 *
 */
export const MessageType = {
    Reply               : 0,
    Notification        : 1,
    AsyncNotification   : 2,
} as const

export type MessageType = ObjectValues<typeof MessageType>


/**@internal
 * WebSdk message DTO
 */
export interface Message {
    readonly Type?: MessageType;
    readonly Data?: Base64UrlString;
}

/**@internal
 *
 */
export const MethodType = {
    EnumerateReaders        : 1,
    EnumerateCards          : 2,
    GetCardInfo             : 3,
    GetCardUID              : 4,
    GetCardAuthData         : 5,
    GetCardEnrollData       : 6,
    GetCardDataEx           : 10,
    GetCardCancel           : 11,
    Subscribe               : 100,
    Unsubscribe             : 101,
} as const
export type MethodType = ObjectValues<typeof MethodType>

/**@internal
 * Card SDK request DTO
 */
export class Command {
    readonly Method: MethodType
    readonly Parameters?: Base64UrlString

    constructor(method: MethodType, params?: object) {
        this.Method = method
        if (params)
            this.Parameters = Base64Url.fromJSON(params)
    }
}

/**@internal
 * Card SDK reply DTO
 */
export interface Reply {
    Method?: MethodType;
    Result?: number;
    Data?: Base64UrlString;
}

/**@internal
 * Card SDK notification types
 */
export const NotificationType = {
    ReaderConnected     : 1,
    ReaderDisconnected  : 2,
    CardInserted        : 3,
    CardRemoved         : 4,
} as const
export type NotificationType = ObjectValues<typeof NotificationType>

/**@internal
 * Card SDK notification DTO
 */
export interface Notification {
    readonly Event?: NotificationType;
    readonly Reader?: string;
}

/**@internal
 * Card SDK async notification types
 */
export const NotificationExType = {
    Paused      : -1,
    NoReader    : 1,
    NoCard      : 2,
    CardError   : 3,
    TooMany     : 4,
} as const
export type NotificationExType = ObjectValues<typeof NotificationExType>

/**@internal
 * Card SDK async notification DTO
 *
 * @example
 *  {
 *    "Event": 0,
 *    "Reader": "HID OMNIKEY 5022",
 *    "Data": {
 *      "Version": "2",
 *      "Type": "CID"
 *      "Data": {
 *        "UID": "BCxWcjoUkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
 *        "tech":"DESFire EV",
 *        "address": 0,
 *        "key": "XVdVVUUzVVV1VVVVgwU0fww8bDOXGpF77cbXCh-nSbtEwO8aHO-wojoGcIg",
 *        "nickname":"DESFire EV"
 *      }
 *    }
 *  }
 */
export interface CompleteNotification {
    readonly Event: 0        // Complete
    readonly Reader?: string
    readonly Data?: CaptureResult
}
export interface FeedbackNotification {
    readonly Event: NotificationExType
    readonly Reader?: string
    readonly Data?: number
}

export type NotificationEx = FeedbackNotification | CompleteNotification
