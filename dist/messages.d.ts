import { Base64UrlString } from "./utils";
import { ObjectValues } from "./utils";
import { Feedback } from "./feedback";
/**@internal
 *
 */
export declare const MessageType: {
    readonly Reply: 0;
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
    readonly GetCardDataEx: 10;
    readonly GetCardCancel: 11;
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
 * Card SDK reply codes
 */
export declare const ReplyCode: {
    readonly Ok: 0;
    readonly Cancelled: 2147943623;
};
export type ReplyCode = ObjectValues<typeof ReplyCode>;
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
/**@internal
 * Card SDK notification DTO
 */
export type NotificationEx = Feedback;
