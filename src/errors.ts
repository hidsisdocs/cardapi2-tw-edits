/** @public
 * Types of errors raised by all SDK services.
 */
export type ErrorMessage
    = "BadVersion"      // Incompatible client version
    | "BadConnection"   // Connection failure
    | "BadResponse"     // Service failure
    | "Aborted"         // The operation was aborted
    | "Timeout"         // The operation gas exceeded a timeout period

export class ApiError extends Error
{
    public code?: number

    constructor(message?: string, code?: number) {
        super(message)
        this.name = "dp.card.ApiError"
        this.code = code
    }
}
