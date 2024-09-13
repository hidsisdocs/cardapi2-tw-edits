/** @public
 * Feedback message constants.
 *
 * @see Feedback.message
 */
export type FeedbackMessage
    = "Starting"                    // the capture process is starting
    | "Paused"                      // the capture process is paused, e.g due to a lost focus
    | "ConnectReader"               // card reader is disconnected or not found
    | "UseCard"                     // generic prompt to insert/tap/swipe a card
    | "UseDifferentCard"            // a card was not read or recognized
    | "UseDifferentCardType"        // a card of unexpected type was used
    | "UseSingleCard"               // multiple cards were used at once

/** @public
 * Feedback object.
 */
export interface Feedback {
    readonly message: string;
    readonly code?: number;
}

/** @public
 * Feedback handler.
 *
 * @see Feedback
 * @see CaptureOptions.onFeedback
 */
export type FeedbackHandler = (feedback: Feedback) => void;

