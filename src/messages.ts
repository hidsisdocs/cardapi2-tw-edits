import { Base64Url, Base64UrlString, ObjectValues } from "./utils.js"
import { Feedback } from "./feedback.js"

/**@internal
 *
 */
export const MessageType = {
    Reply               : 0,
    // Notification        : 1,
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
    // EnumerateReaders        : 1,
    // EnumerateCards          : 2,
    // GetCardInfo             : 3,
    // GetCardUID              : 4,
    // GetCardAuthData         : 5,
    // GetCardEnrollData       : 6,
    GetCardDataEx           : 10,
    GetCardCancel           : 11,
    // Subscribe               : 100,
    // Unsubscribe             : 101,
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
 * Card SDK reply codes
 */
export const ReplyCode = {
    Ok        : 0x00000000,
    Cancelled : 0x800704c7,
} as const
export type ReplyCode = ObjectValues<typeof ReplyCode>

/**@internal
 * Card SDK reply DTO
 */
export interface Reply {
    Method?: MethodType;
    Result?: ReplyCode;
    Data?: Base64UrlString;
}

/**@internal
 * Card SDK notification types
 */
// export const NotificationType = {
//     ReaderConnected     : 1,
//     ReaderDisconnected  : 2,
//     CardInserted        : 3,
//     CardRemoved         : 4,
// } as const
// export type NotificationType = ObjectValues<typeof NotificationType>

/**@internal
 * Card SDK notification DTO
 */
// export interface Notification {
//     readonly Event?: NotificationType;
//     readonly Reader?: string;
// }

export type NotificationEx = Feedback
