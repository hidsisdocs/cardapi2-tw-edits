/** @public
 * Types of errors raised by all SDK services.
 */
export type ErrorMessage = "BadVersion" | "BadConnection" | "BadResponse" | "Aborted" | "Timeout";
export declare class ApiError extends Error {
    code?: number;
    constructor(message?: string, code?: number);
}
