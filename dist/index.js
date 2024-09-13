// src/errors.ts
var ApiError = class extends Error {
  constructor(message, code) {
    super(message);
    this.name = "dp.card.ApiError";
    this.code = code;
  }
};

// src/capture.ts
import { Base64Url as Base64Url2, Utf8 } from "@digitalpersona/core";

// src/messages.ts
import { Base64Url } from "@digitalpersona/core";
var MessageType = {
  Reply: 0,
  Notification: 1,
  AsyncNotification: 2
};
var MethodType = {
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
var Command = class {
  constructor(method, params) {
    this.Method = method;
    if (params)
      this.Parameters = Base64Url.fromJSON(params);
  }
};
var NotificationExType = {
  Paused: -1,
  NoReader: 1,
  NoCard: 2,
  CardError: 3,
  TooMany: 4
};

// src/capture.ts
function capture(purpose, options) {
  if (!purpose) return Promise.reject(new Error("dp.card.capture.purpose.empty"));
  if (options?.signal) return Promise.reject(new ApiError("Aborted"));
  return new Promise((resolve, reject) => {
    try {
      const channel = new WebSdk.WebChannelClient("smartcards", options?.channelOptions);
      let lastActivity = Date.now();
      const bump = () => {
        if (options?.signal) abort();
        lastActivity = Date.now();
      };
      const connect = () => {
        bump();
        channel.connect();
      };
      const send = (command) => {
        bump();
        channel.sendDataTxt(Base64Url2.fromJSON(command));
      };
      const done = (value) => {
        reset();
        resolve(value);
      };
      const fail = (message, code) => {
        reset();
        reject(new ApiError(message, code));
      };
      const abort = () => {
        send(new Command(MethodType.GetCardCancel));
        fail("Aborted");
      };
      const reset = () => {
        channel.disconnect();
        window.clearTimeout(watchdog);
      };
      const onConnectionFailed = () => fail("BadConnection");
      const onConnectionSucceed = () => send(new Command(MethodType.GetCardDataEx, { Version: 2, Token: options?.cardType }));
      const onDataReceivedTxt = (data) => {
        bump();
        const { Type, Data } = decodeAs(data);
        switch (Type) {
          case MessageType.Reply: {
            const res = decodeAs(Data);
            if (!res || res.Method !== MethodType.GetCardDataEx) return;
            const code = unsigned(res?.Result ?? 0);
            if (code > 2147483647) return fail("BadResponse", code);
            break;
          }
          case MessageType.Notification: {
            break;
          }
          case MessageType.AsyncNotification: {
            const res = decodeAs(Data);
            if (!res) return;
            if (typeof res?.Event === "undefined") return;
            if (res.Event === 0) {
              return res.Data ? done(res.Data) : fail("BadResponse");
            } else {
              const feedback = toFeedback(res);
              if (feedback) try {
                options?.onFeedback?.(feedback);
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
      options?.onFeedback?.({ message: "Starting" });
      connect();
      const timeout = (options?.inactivityTimeout ?? Number.POSITIVE_INFINITY) * 1e3;
      const watchdogInterval = 200;
      let watchdog = window.setTimeout(function check() {
        if (options?.signal) return abort();
        if (Date.now() - lastActivity > timeout) return fail("Timeout");
        watchdog = window.setTimeout(check, watchdogInterval);
      }, watchdogInterval);
    } catch (error) {
      if (error instanceof Error)
        reject(error);
      else
        reject(new Error(`UnknowError: ${error}`));
    }
  });
}
function unsigned(n) {
  return n >>> 0;
}
function decodeAs(data) {
  return JSON.parse(Utf8.fromBase64Url(data ?? ""));
}
function toFeedback(notification) {
  const code = notification.Data;
  switch (notification.Event) {
    case NotificationExType.NoReader:
      return { message: "ConnectReader", code };
    case NotificationExType.NoCard:
      return { message: "UseCard", code };
    case NotificationExType.CardError:
      return { message: "UseDifferentCard", code };
    case NotificationExType.TooMany:
      return { message: "UseSingleCard", code };
    default:
      return { message: "System", code };
  }
}
export {
  ApiError,
  capture
};
