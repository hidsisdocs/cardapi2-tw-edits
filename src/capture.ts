///<reference types="../node_modules/@digitalpersona/websdk/dts/websdk.client.d.ts" />

import { Base64Url, Utf8 } from "./utils.js"
import { CaptureResult, CardType } from "./card.js"
import { Feedback, FeedbackHandler } from "./feedback.js"
import { MethodType, Command, Message, MessageType, NotificationEx, Reply, ReplyCode } from "./messages.js"
import { ApiError } from "./errors.js"

export type Purpose
    = "auth"        // Card data will be used for authentication
    | "enroll"      // Card data will be used for enrollment

export interface CaptureOptions {
    readonly cardType?: CardType | ''                        // If not provided or empty, any card type is accepted
    readonly inactivityTimeout?: number                      // inactivity timeout in seconds; default is infinite
    readonly signal?: AbortSignal                            // A capture abort signal from an `AbortController`
    readonly onFeedback?: FeedbackHandler                    // A capture feeedback handler
    readonly channelOptions?: WebSdk.WebChannelOptionsData   // TODO: or pass a prepared channel?
    readonly debug: boolean
}

/**@public
 * Captures card data
 *
 * @param purpose   The purpose of card data collection (enrollment or authentication)
 * @param options   Optional parameters
 * @returns Promise of a `CaptureResult` object
 *
 * @example Capture auth data from any card, no feedback, no cancellation, default timeout
 *
 *  const cardData = await capture("auth")
 *  const authToken = authenticate(cardData)
 *
 * @example Capture enroll data from Contactless Writable cards, with feedback and cancellation, custom timeout of 3 min
 *
 * captureButton.onclick = async() => {
 *      const ac = new AbortController();
 *      try {
 *          // prepare a cancel button
 *          cancelButton.onclick = () => ac.abort()
 *
 *          const cardData = await capture("enroll", {
 *              cardType: "CW",
 *              signal: ac.signal,
 *              onFeedback: updateFeedbackView,
 *              timeout: 3*60
 *          });
 *          const enrolled = await enroll(cardData)
 *      }
 *      catch(e) {
 *          updateErrorView(e)
 *      } finally {
 *          cancelButton.onclick = null
 *      }
 * }
 *
 *
 */
export function capture(
    purpose: Purpose,
    options?: CaptureOptions
): Promise<CaptureResult>
{
    // validate input
    if (!purpose) return Promise.reject(new Error("dp.card.capture.purpose.empty"))

    if (options?.signal?.aborted) return Promise.reject(new ApiError("Aborted"))

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const log = options?.debug ? console.log : () => {}

    log("==>capture()", purpose, options)
    return new Promise((resolve, reject) => {
        try {
            // an exception-safe feedback handler wrapper
            const onFeedback = (feedback: Feedback) => {
                if (options?.onFeedback) try {
                    options.onFeedback(feedback)
                } catch(e) {
                    log (`Exception thrown in 'dp.card.capture.onFeedback': ${e || "n/a"}`)
                }
            }

            const channel = new WebSdk.WebChannelClient("smartcards", options?.channelOptions)

            // WORKAROUND! WebSdk caches SRP/session data, which causes issues with ADC upgrades. Clean it.
            // sessionStorage.removeItem("websdk")
            // sessionStorage.removeItem("websdk.sessionId")

            // NOTE: the Date.now() is not monotonic and may revert back on system time changes.
            // To avoid negative timeout intervals, use the Performance API everywhere.
            let lastActivity = performance.now()

            let aborting = false
            // register a new activity, after checking we're still good to go
            const bump = () => {
                if (!aborting && options?.signal?.aborted) abort()
                lastActivity = performance.now()
            }
            // transient states
            const connect   = ()                    => { bump(); log("connecting..."); channel.connect(1) }
            const send      = (command: object)     => { bump(); log("sending...", command); channel.sendDataTxt(Base64Url.fromJSON(command)) }

            // terminal states; USE ONLY THOSE TO RESOLVE/REJECT!
            const done  = (value: CaptureResult)            => { reset(); log("<==capture(): done", value); resolve(value) }
            const fail  = (message: string, code?: number)  => { reset(); log("<==capture(): fail", message, code); reject(new ApiError(message, code)) }
            const abort = () => {
                aborting = true
                send(new Command(MethodType.GetCardCancel))
                fail("Aborted")
            }

            // cleanup for terminal states
            const reset = () => {
                // TODO: `disconnect` does not stop multiply reconnection attempts and we still receive multiple onConnecctionFailed().
                // Needs a fix in WebSdk (add an `attempts` parameter to the `WebSdkChannel.connect()` and pass 1).
                channel.disconnect()
                clearTimeout(watchdog)
            }

            const onConnectionFailed    = () => fail("BadConnection")
            const onConnectionSucceed   = () => send(new Command(MethodType.GetCardDataEx, {
                Version: 2,
                Case: purpose,
                Type: options?.cardType || '',
            }))

            const onDataReceivedTxt = (data: string) => {
                bump()
                const { Type, Data } = decodeAs<Message>(data)
                switch (Type) {
                    case MessageType.Reply: {
                        const res = decodeAs<Reply>(Data)
                        log("Got reply", res)
                        if (!res || res.Method !== MethodType.GetCardDataEx) return // silently ignore unexpected replies
                        const code = unsigned(res?.Result ?? 0) as ReplyCode
                        switch(code) {
                            case ReplyCode.Ok: {
                                if (res.Data)
                                    return done(JSON.parse(res.Data) as CaptureResult)
                                break
                            }
                            case ReplyCode.Cancelled:
                                return abort()
                            default:
                                if (code > 0x7FFFFFFF) return fail(res.Data ?? "BadResponse", code) // TODO: does "BadVersion" occurs here too?
                        }
                        // we're fine, proceed
                        break
                    }
                    // case MessageType.Notification: {
                    //     // Not interested in regular notifications here
                    //     break
                    // }
                    case MessageType.AsyncNotification: {
                        const res = decodeAs<NotificationEx>(Data)
                        log("Got async note", res)
                        if (res) try {
                            onFeedback(res)
                        } catch (e) {
                            log("Feedback handler has thrown.", e)
                        }
                        break
                    }
                    default: log(`Unknown response type: ${Type}`)
                }
            }

            channel.onConnectionSucceed = onConnectionSucceed
            channel.onConnectionFailed = onConnectionFailed
            channel.onDataReceivedTxt = onDataReceivedTxt

            onFeedback({ message: "Starting" })
            connect()

            const timeout = (options?.inactivityTimeout ?? Number.POSITIVE_INFINITY)*1000
            const watchdogInterval = 200

            // Run a watchdog timer to watch for abort signal and timouts.
            // Note: using safer recursive setTimeout instead of setInterval to guarantee
            // execution time never gets longer than the timer interval
            //
            // TODO: in web extensions, the `setTimeout` may not work reliably;
            // extensions should use `alarms` API.
            let watchdog = setTimeout(function check() {
                if (options?.signal?.aborted)               return abort()
                if ((performance.now() - lastActivity) > timeout)  return fail("Timeout")
                watchdog = setTimeout(check, watchdogInterval)
            }, watchdogInterval)
        }
        catch(error) {
            if (error instanceof Error)
                reject(error)
            else
                reject(new Error(`UnknowError: ${error}`))
        }
    })
}

function unsigned(n: number) { return n >>> 0 }

function decodeAs<T>(data?: string): T {
    return JSON.parse(Utf8.fromBase64Url(data ?? "")) as T
}
