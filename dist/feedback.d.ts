/** @public
 * Feedback message constants.
 *
 * @see Feedback.message
 */
export type FeedbackMessage = "Starting" | "Paused" | "ConnectReader" | "UseCard" | "UseDifferentCard" | "UseDifferentCardType" | "UseSingleCard";
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
