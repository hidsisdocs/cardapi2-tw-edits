class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = void 0;
    this.name = "dp.card.ApiError";
    this.code = code;
  }
}

var _Utf2, _Base, _Base64Url;
/**
 * Set of converters to UTF16.
 */
class Utf16 {}
/**
 * Set of converters to UTF8.
 */
// /** Converts a UTF8 string to a UTF16 string. */
// public static fromUtf8 = (s: Utf8String): Utf16String =>
//     decodeURIComponent(escape(Utf8.noBom(s)))
// /** Decodes a Base64-encoded string to a UTF16 string. */
// public static fromBase64 = (s: Base64String): Utf16String =>
//     Utf16.fromUtf8(Utf8.fromBase64(s))
// /** Decodes a Base64url-encoded string to a UTF16 string. */
// public static fromBase64Url = (s: Base64UrlString): Utf16String =>
//     Utf16.fromUtf8(Utf8.fromBase64Url(s))
// /** Appends Byte-Order-Mark (BOM) to the UTF16 string. */
// public static withBom   = (s: Utf16String): Utf16String =>
//     "\uFEFF" + s
/** Strips a Byte-Order-Mark (BOM) from the UTF16 string. */
Utf16.noBom = s => s.replace(/^\uFEFF/, "");
class Utf8 {}
/**
 * Set of converters to Base64.
 */
_Utf2 = Utf8;
/** Converts a UTF16 string to a UTF8 string. */
Utf8.fromUtf16 = s => unescape(encodeURIComponent(Utf16.noBom(s)));
/** Decodes a Base64-encoded string to a UTF8 string. */
Utf8.fromBase64 = s => atob(s);
/** Decodes a Base64url-encoded string to a UTF8 string. */
Utf8.fromBase64Url = s => _Utf2.fromBase64(Base64.fromBase64Url(s));
class Base64 {}
/**
 * Set of converters to Base64Url.
 */
_Base = Base64;
/** Encodes a UTF8 string to a Base64-encoded string. */
Base64.fromUtf8 = s => btoa(s);
/** Encodes a UTF16 string to a Base64-encoded string.  */
Base64.fromUtf16 = s => _Base.fromUtf8(Utf8.fromUtf16(s));
/** Converts a Base64url-encoded string to a Base64-encoded string. */
Base64.fromBase64Url = s => (s.length % 4 === 2 ? s + "==" : s.length % 4 === 3 ? s + "=" : s).replace(/-/g, "+").replace(/_/g, "/");
class Base64Url {}
_Base64Url = Base64Url;
/** Converts a Base64-encoded string to a Base64url-encoded string. */
Base64Url.fromBase64 = s => s.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
// /** Converts a UTF8 string to a Base64url-encoded string. */
// public static fromUtf8 = (s: Utf8String) =>
//     Base64Url.fromBase64(Base64.fromUtf8(s))
/** Converts a UTF16 string to a Base64url-encoded string. */
Base64Url.fromUtf16 = s => _Base64Url.fromBase64(Base64.fromUtf16(s));
// /** Converts a byte array to a Base64url-encoded string. */
// public static fromBytes = (bytes: Uint8Array): Base64UrlString =>
//     Base64Url.fromUtf8(Utf8.fromBytes(bytes))
/** Encodes a plain JSON object or a string to a Base64url-encoded string. */
Base64Url.fromJSON = obj => _Base64Url.fromUtf16(JSON.stringify(obj));

/**@internal
 *
 */
const MessageType = {
  Reply: 0,
  // Notification        : 1,
  AsyncNotification: 2
};
/**@internal
 *
 */
const MethodType = {
  // EnumerateReaders        : 1,
  // EnumerateCards          : 2,
  // GetCardInfo             : 3,
  // GetCardUID              : 4,
  // GetCardAuthData         : 5,
  // GetCardEnrollData       : 6,
  GetCardDataEx: 10,
  GetCardCancel: 11
  // Subscribe               : 100,
  // Unsubscribe             : 101,
};
/**@internal
 * Card SDK request DTO
 */
class Command {
  constructor(method, params) {
    this.Method = void 0;
    this.Parameters = void 0;
    this.Method = method;
    if (params) this.Parameters = Base64Url.fromJSON(params);
  }
}
/**@internal
 * Card SDK reply codes
 */
const ReplyCode = {
  Ok: 0x00000000,
  Cancelled: 0x800704c7
};

///<reference types="WebSdk" />
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
function capture(purpose, options) {
  var _options$signal;
  // validate input
  if (!purpose) return Promise.reject(new Error("dp.card.capture.purpose.empty"));
  if (options != null && (_options$signal = options.signal) != null && _options$signal.aborted) return Promise.reject(new ApiError("Aborted"));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const log = options != null && options.debug ? console.log : () => {};
  log("==>capture()", purpose, options);
  return new Promise((resolve, reject) => {
    try {
      var _options$inactivityTi;
      const channel = new WebSdk.WebChannelClient("smartcards", options == null ? void 0 : options.channelOptions);
      // WORKAROUND! WebSdk caches SRP/session data, which causes issues with ADC upgrades. Clean it.
      // sessionStorage.removeItem("websdk")
      // sessionStorage.removeItem("websdk.sessionId")
      // NOTE: the Date.now() is not monotonic and may revert back on system time changes.
      // To avoid negative timeout intervals, use the Performance API everywhere.
      let lastActivity = performance.now();
      let aborting = false;
      // register a new activity, after checking we're still good to go
      const bump = () => {
        var _options$signal2;
        if (!aborting && options != null && (_options$signal2 = options.signal) != null && _options$signal2.aborted) abort();
        lastActivity = performance.now();
      };
      // transient states
      const connect = () => {
        bump();
        log("connecting...");
        channel.connect(1);
      };
      const send = command => {
        bump();
        log("sending...", command);
        channel.sendDataTxt(Base64Url.fromJSON(command));
      };
      // terminal states; USE ONLY THOSE TO RESOLVE/REJECT!
      const done = value => {
        reset();
        log("<==capture(): done", value);
        resolve(value);
      };
      const fail = (message, code) => {
        reset();
        log("<==capture(): fail", message, code);
        reject(new ApiError(message, code));
      };
      const abort = () => {
        aborting = true;
        send(new Command(MethodType.GetCardCancel));
        fail("Aborted");
      };
      // cleanup for terminal states
      const reset = () => {
        // TODO: `disconnect` does not stop multiply reconnection attempts and we still receive multiple onConnecctionFailed().
        // Needs a fix in WebSdk (add an `attempts` parameter to the `WebSdkChannel.connect()` and pass 1).
        channel.disconnect();
        window.clearTimeout(watchdog);
      };
      const onConnectionFailed = () => fail("BadConnection");
      const onConnectionSucceed = () => send(new Command(MethodType.GetCardDataEx, {
        Version: 2,
        Case: purpose,
        Type: options == null ? void 0 : options.cardType
      }));
      const onDataReceivedTxt = data => {
        var _res$Data;
        bump();
        const {
          Type,
          Data
        } = decodeAs(data);
        switch (Type) {
          case MessageType.Reply:
            {
              var _res$Result;
              const res = decodeAs(Data);
              log("Got reply", res);
              if (!res || res.Method !== MethodType.GetCardDataEx) return; // silently ignore unexpected replies
              const code = unsigned((_res$Result = res == null ? void 0 : res.Result) != null ? _res$Result : 0);
              switch (code) {
                case ReplyCode.Ok:
                  {
                    if (res.Data) return done(JSON.parse(res.Data));
                    break;
                  }
                case ReplyCode.Cancelled:
                  return abort();
                default:
                  if (code > 0x7FFFFFFF) return fail((_res$Data = res.Data) != null ? _res$Data : "BadResponse", code);
                // TODO: does "BadVersion" occurs here too?
              }
              // we're fine, proceed
              break;
            }
          // case MessageType.Notification: {
          //     // Not interested in regular notifications here
          //     break
          // }
          case MessageType.AsyncNotification:
            {
              const res = decodeAs(Data);
              log("Got async note", res);
              if (res) try {
                options == null || options.onFeedback == null || options.onFeedback(res);
              } catch (e) {
                log("Feedback handler has thrown.", e);
              }
              break;
            }
          default:
            log(`Unknown response type: ${Type}`);
        }
      };
      channel.onConnectionSucceed = onConnectionSucceed;
      channel.onConnectionFailed = onConnectionFailed;
      channel.onDataReceivedTxt = onDataReceivedTxt;
      options == null || options.onFeedback == null || options.onFeedback({
        message: "Starting"
      });
      connect();
      const timeout = ((_options$inactivityTi = options == null ? void 0 : options.inactivityTimeout) != null ? _options$inactivityTi : Number.POSITIVE_INFINITY) * 1000;
      const watchdogInterval = 200;
      // Run a watchdog timer to watch for abort signal and timouts.
      // Note: using safer recursive setTimeout instead of setInterval to guarantee
      // execution time never gets longer than the timer interval
      //
      // TODO: in web extensions, the `setTimeout` may not work reliably;
      // extensions should use `alarms` API.
      let watchdog = window.setTimeout(function check() {
        var _options$signal3;
        if (options != null && (_options$signal3 = options.signal) != null && _options$signal3.aborted) return abort();
        if (performance.now() - lastActivity > timeout) return fail("Timeout");
        watchdog = window.setTimeout(check, watchdogInterval);
      }, watchdogInterval);
    } catch (error) {
      if (error instanceof Error) reject(error);else reject(new Error(`UnknowError: ${error}`));
    }
  });
}
function unsigned(n) {
  return n >>> 0;
}
function decodeAs(data) {
  return JSON.parse(Utf8.fromBase64Url(data != null ? data : ""));
}

export { ApiError, capture };
//# sourceMappingURL=index.js.map
