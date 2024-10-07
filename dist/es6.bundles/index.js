import { Base64Url, Utf8 } from '@digitalpersona/core';

class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = void 0;
    this.name = "dp.card.ApiError";
    this.code = code;
  }
}

/**@internal
 *
 */
const MessageType = {
  Reply: 0,
  Notification: 1,
  AsyncNotification: 2
};
/**@internal
 *
 */
const MethodType = {
  EnumerateReaders: 1,
  EnumerateCards: 2,
  GetCardInfo: 3,
  GetCardUID: 4,
  GetCardAuthData: 5,
  GetCardEnrollData: 6,
  GetCardDataEx: 10,
  GetCardCancel: 11,
  Subscribe: 100,
  Unsubscribe: 101
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
 * Card SDK async notification types
 */
const NotificationExType = {
  Paused: -1,
  NoReader: 1,
  NoCard: 2,
  CardError: 3,
  TooMany: 4
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
  const log = options != null && options.debug ? console.log : () => {};
  log("==>capture()", purpose, options);
  return new Promise((resolve, reject) => {
    try {
      var _options$inactivityTi;
      const channel = new WebSdk.WebChannelClient("smartcards", options == null ? void 0 : options.channelOptions);
      let lastActivity = Date.now();
      let aborting = false;
      // register a new activity, after checking we're still good to go
      const bump = () => {
        var _options$signal2;
        if (!aborting && options != null && (_options$signal2 = options.signal) != null && _options$signal2.aborted) abort();
        lastActivity = Date.now();
      };
      // transient states
      const connect = () => {
        bump();
        log("connecting...");
        channel.connect();
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
        channel.disconnect();
        window.clearTimeout(watchdog);
      };
      const onConnectionFailed = () => fail("BadConnection");
      const onConnectionSucceed = () => send(new Command(MethodType.GetCardDataEx, {
        Version: 2,
        Token: options == null ? void 0 : options.cardType
      }));
      const onDataReceivedTxt = data => {
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
              if (code > 0x7FFFFFFF) return fail("BadResponse", code); // TODO: does "BadVersion" occurs here too?
              // we're fine, proceed
              break;
            }
          case MessageType.Notification:
            {
              // Not interested in regular notifications here
              break;
            }
          case MessageType.AsyncNotification:
            {
              const res = decodeAs(Data);
              log("Got async note", res);
              if (!res) return;
              if (typeof (res == null ? void 0 : res.Event) === "undefined") return;
              if (res.Event === 0) {
                return res.Data ? done(res.Data) : fail("BadResponse");
              } else {
                const feedback = toFeedback(res);
                if (feedback) try {
                  options == null || options.onFeedback == null || options.onFeedback(feedback);
                } catch (e) {
                  console.debug("Feedback handler has thrown.", e);
                }
              }
              break;
            }
          default:
            console.log(`Unknown response type: ${Type}`);
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
      let watchdog = window.setTimeout(function check() {
        var _options$signal3;
        if (options != null && (_options$signal3 = options.signal) != null && _options$signal3.aborted) return abort();
        if (Date.now() - lastActivity > timeout) return fail("Timeout");
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
function toFeedback(notification) {
  const code = notification.Data; // TODO: different documents say different about `Data`
  switch (notification.Event) {
    case NotificationExType.NoReader:
      return {
        message: "ConnectReader",
        code
      };
    case NotificationExType.NoCard:
      return {
        message: "UseCard",
        code
      };
    case NotificationExType.CardError:
      return {
        message: "UseDifferentCard",
        code
      };
    case NotificationExType.TooMany:
      return {
        message: "UseSingleCard",
        code
      };
    default:
      return {
        message: "System",
        code
      };
  }
}

export { ApiError, capture };
//# sourceMappingURL=index.js.map
