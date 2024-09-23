///<reference types="WebSdk" />
import { Base64Url, Utf8 } from "@digitalpersona/core"
import { CaptureResult, CardType } from "./card"
import { Feedback, FeedbackHandler } from "./feedback"
import { MethodType, Command, Message, MessageType, NotificationEx, Reply, FeedbackNotification, NotificationExType } from "./messages"
import { ApiError } from "./errors"

export type Purpose
    = "auth"        // Card data will be used for authentication
    | "enroll"      // Card data will be used for enrollment

export interface CaptureOptions {
    readonly cardType?: CardType                             // If not provided or empty, any card type is accepted
    readonly inactivityTimeout?: number                      // inactivity timeout in seconds; default is infinite
    readonly signal?: AbortSignal                            // A capture abort signal from an `AbortController`
    readonly onFeedback?: FeedbackHandler                    // A capture feeedback handler
    readonly channelOptions?: WebSdk.WebChannelOptions       // TODO: or pass a prepared channel?
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

    return new Promise((resolve, reject) => {
        try {
            const channel = new WebSdk.WebChannelClient("smartcards", options?.channelOptions)

            let lastActivity = Date.now()
            // register a new activity, after checking we're still good to go
            const bump = () => {
                if (options?.signal?.aborted) abort()
                lastActivity = Date.now()
            }
            // transient states
            const connect   = ()                    => { bump(); channel.connect()  }
            const send      = (command: Command)    => { bump(); channel.sendDataTxt(Base64Url.fromJSON(command)) }

            // terminal states; USE ONLY THOSE TO RESOLVE/REJECT!
            const done  = (value: CaptureResult)            => { reset(); resolve(value) }
            const fail  = (message: string, code?: number)  => { reset(); reject(new ApiError(message, code)) }
            const abort = () => {
                send(new Command(MethodType.GetCardCancel))
                fail("Aborted")
            }

            // cleanup for terminal states
            const reset = () => {
                channel.disconnect()
                window.clearTimeout(watchdog)
            }

            const onConnectionFailed    = () => fail("BadConnection")
            const onConnectionSucceed   = () => send(new Command(MethodType.GetCardDataEx, { Version: 2, Token: options?.cardType }))

            const onDataReceivedTxt = (data: string) => {
                bump()
                const { Type, Data } = decodeAs<Message>(data)
                switch (Type) {
                    case MessageType.Reply: {
                        const res = decodeAs<Reply>(Data)
                        if (!res || res.Method !== MethodType.GetCardDataEx) return // silently ignore unexpected replies
                        const code = unsigned(res?.Result ?? 0)
                        if (code > 0x7FFFFFFF) return fail("BadResponse", code) // TODO: does "BadVersion" occurs here too?
                        // we're fine, proceed
                        break
                    }
                    case MessageType.Notification: {
                        // Not interested in regular notifications here
                        break
                    }
                    case MessageType.AsyncNotification: {
                        const res = decodeAs<NotificationEx>(Data)
                        if (!res) return
                        if ((typeof(res?.Event) === "undefined")) return
                        if (res.Event === 0) {
                            return res.Data ? done(res.Data) : fail("BadResponse")
                        }
                        else {
                            const feedback = toFeedback(res)
                            if (feedback) try {
                                options?.onFeedback?.(feedback)
                            } catch (e) {
                                console.debug("Feedback handler has thrown.", e)
                            }
                        }
                        break
                    }
                    default: console.log(`Unknown response type: ${Type}`)
                }
            }

            channel.onConnectionSucceed = onConnectionSucceed
            channel.onConnectionFailed = onConnectionFailed
            channel.onDataReceivedTxt = onDataReceivedTxt

            options?.onFeedback?.({ message: "Starting" })
            connect()

            const timeout = (options?.inactivityTimeout ?? Number.POSITIVE_INFINITY)*1000
            const watchdogInterval = 200

            // Run a watchdog timer to watch for abort signal and timouts.
            // Note: using safer recursive setTimeout instead of setInterval to guarantee
            // execution time never gets longer than the timer interval
            let watchdog = window.setTimeout(function check() {
                if (options?.signal?.aborted)               return abort()
                if ((Date.now() - lastActivity) > timeout)  return fail("Timeout")
                watchdog = window.setTimeout(check, watchdogInterval)
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

function toFeedback(notification: FeedbackNotification): Feedback | null {
    const code = notification.Data  // TODO: different documents say different about `Data`

    switch(notification.Event) {
        case NotificationExType.NoReader    : return { message: "ConnectReader", code }
        case NotificationExType.NoCard      : return { message: "UseCard", code }
        case NotificationExType.CardError   : return { message: "UseDifferentCard", code }
        case NotificationExType.TooMany     : return { message: "UseSingleCard", code }
        default                             : return { message: "System", code }
    }
}
