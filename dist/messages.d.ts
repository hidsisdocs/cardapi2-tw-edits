import { Base64UrlString } from "@digitalpersona/core";
import { ObjectValues } from "./utils";
import { CaptureResult } from "./card";
/**@internal
 *
 */
export declare const MessageType: {
    readonly Reply: 0;
    readonly Notification: 1;
    readonly AsyncNotification: 2;
};
export type MessageType = ObjectValues<typeof MessageType>;
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
export declare const MethodType: {
    readonly EnumerateReaders: 1;
    readonly EnumerateCards: 2;
    readonly GetCardInfo: 3;
    readonly GetCardUID: 4;
    readonly GetCardAuthData: 5;
    readonly GetCardEnrollData: 6;
    readonly GetCardDataEx: 10;
    readonly GetCardCancel: 11;
    readonly Subscribe: 100;
    readonly Unsubscribe: 101;
};
export type MethodType = ObjectValues<typeof MethodType>;
/**@internal
 * Card SDK request DTO
 */
export declare class Command {
    readonly Method: MethodType;
    readonly Parameters?: Base64UrlString;
    constructor(method: MethodType, params?: object);
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
export declare const NotificationType: {
    readonly ReaderConnected: 1;
    readonly ReaderDisconnected: 2;
    readonly CardInserted: 3;
    readonly CardRemoved: 4;
};
export type NotificationType = ObjectValues<typeof NotificationType>;
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
export declare const NotificationExType: {
    readonly Paused: -1;
    readonly NoReader: 1;
    readonly NoCard: 2;
    readonly CardError: 3;
    readonly TooMany: 4;
};
export type NotificationExType = ObjectValues<typeof NotificationExType>;
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
    readonly Event: 0;
    readonly Reader?: string;
    readonly Data?: CaptureResult;
}
export interface FeedbackNotification {
    readonly Event: NotificationExType;
    readonly Reader?: string;
    readonly Data?: number;
}
export type NotificationEx = FeedbackNotification | CompleteNotification;
