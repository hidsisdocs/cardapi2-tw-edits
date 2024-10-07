import { CaptureResult, CardType } from "./card";
import { FeedbackHandler } from "./feedback";
export type Purpose = "auth" | "enroll";
export interface CaptureOptions {
    readonly cardType?: CardType;
    readonly inactivityTimeout?: number;
    readonly signal?: AbortSignal;
    readonly onFeedback?: FeedbackHandler;
    readonly channelOptions?: WebSdk.WebChannelOptions;
    readonly debug: boolean;
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
export declare function capture(purpose: Purpose, options?: CaptureOptions): Promise<CaptureResult>;
