///<reference types="../node_modules/@digitalpersona/websdk/dts/websdk.client.d.ts" />
namespace Card {

    export function b64UrlTo64(a: string): string {
        if (a.length % 4 == 2) {
            a = a + "==";
        } else {
            if (a.length % 4 == 3) {
                a = a + "=";
            }
        }
        a = a.replace(/-/g, "+");
        a = a.replace(/_/g, "/");
        return a;
    }

    export function b64To64Url(a: string): string {
        a = a.replace(/\=/g, "");
        a = a.replace(/\+/g, "-");
        a = a.replace(/\//g, "_");
        return a;
    }

    export function b64UrlToUtf8(str: string): string {
        return window.atob(b64UrlTo64(str));
    }

    export function strToB64Url(str: string): string {
        return b64To64Url(window.btoa(str));
    }

    export enum CardType {
        Contact = 1,
        Contactless = 2,
        Proximity = 4
    }

    export enum CardAttributes {
        SupportsPIN = 1,
        SupportsUID = 2,
        IsPKI = 0x00010000,
        IsPIV = 0x00020000,
        IsReadOnly = 0x80000000
    }

    export class Event {
        type: string;
        constructor(type: string) {
            this.type = type;
        }
    }

    export class CommunicationEvent extends Event {
        constructor(type: string) {
            super(type);
        }
    }

    export class CommunicationFailed extends CommunicationEvent {
        constructor() {
            super("CommunicationFailed");
        }
    }

    export class DeviceEvent extends Event {
        Reader: string;
        constructor(type: string, reader: string) {
            super(type);
            this.Reader = reader;
        }
    }

    export class ReaderConnected extends DeviceEvent {
        constructor(reader: string) {
            super("ReaderConnected", reader);
        }
    }

    export class ReaderDisconnected extends DeviceEvent {
        constructor(reader: string) {
            super("ReaderDisconnected", reader);
        }
    }

    export class CardInserted extends DeviceEvent {
        Card: string;
        constructor(reader: string, card: string) {
            super("CardInserted", reader);
            this.Card = card;
        }
    }

    export class CardRemoved extends DeviceEvent {
        Card: string;
        constructor(reader: string, card: string) {
            super("CardRemoved", reader);
            this.Card = card;
        }
    }

    export interface Handler<E> {
        (event: E): any;
    }

    export interface MultiCastEventSoure {
        on(event: string, handler: Handler<Event>): MultiCastEventSoure;
        off(event?: string, handler?: Handler<Event>): MultiCastEventSoure;
    }

    export interface CommunicationEventSource {
        onCommunicationFailed?: Handler<CommunicationFailed>;
    }

    export interface DeviceEventSource {
        onReaderConnected?: Handler<ReaderConnected>;
        onReaderDisconnected?: Handler<ReaderDisconnected>;
        onCardInserted?: Handler<CardInserted>;
        onCardRemoved?: Handler<CardRemoved>;
    }

    export interface EventSource extends DeviceEventSource, CommunicationEventSource, MultiCastEventSoure {
        on(event: string, handler: Handler<Event>): EventSource;
        on(event: "ReaderConnected", handler: Handler<ReaderConnected>): EventSource;
        on(event: "ReaderDisconnected", handler: Handler<ReaderDisconnected>): EventSource;
        on(event: "CardInserted", handler: Handler<CardInserted>): EventSource;
        on(event: "CardRemoved", handler: Handler<CardRemoved>): EventSource;
        on(event: "CommunicationFailed", handler: Handler<CommunicationFailed>): EventSource;
        off(event?: string, handler?: Handler<Event>): EventSource;
    }

    export interface CardInfo {
        Name: string;
        Reader: string;
        Type: CardType;
        Attributes: CardAttributes;
    }

    enum Method {
        EnumerateReaders = 1,
        EnumerateCards = 2,
        GetCardInfo = 3,
        GetCardUID = 4,
        GetDPCardAuthData = 5,
        GetDPCardEnrollData = 6,
        GetCardObjectName = 7,
        Subscribe = 100,
        Unsubscribe = 101
    }

    enum NotificationType {
        ReaderConnected = 1,
        ReaderDisconnected = 2,
        CardInserted = 3,
        CardRemoved = 4
    }

    enum MessageType {
        Response = 0,
        Notification = 1
    }

    interface Response {
        Method: Method;
        Result: number;
        Data?: string;
    }

    interface Notification {
        Event: NotificationType;
        Reader: string;
        Card?: string;
    }

    interface Message {
        Type: MessageType;
        Data: string;
    }

    interface EnumerateReadersResponse {
        ReadersCount: number;
        Readers: string;
    }

    interface EnumerateCardsResponse {
        CardsCount: number;
        Cards: string;
    }

    class Command {
        Method: Method;
        Parameters?: string;
        constructor(method: Method, parameters?: string) {
            this.Method = method;
            if (parameters)
                this.Parameters = parameters;
        }
    }

    class Request {
        command: Command;
        resolve: Function;
        reject: Function;
        sent: boolean;
        constructor(command: Command, resolve: Function, reject: Function) {
            this.command = command;
            this.resolve = resolve;
            this.reject = reject;
            this.sent = false;
        }
    }

    export class WebApi implements EventSource {

        private webChannel: WebSdk.WebChannelClient;
        private requests: Request[] = [];
        private handlers: { [key: string]: Handler<Event>[] } = {};

        constructor(options?: WebSdk.WebChannelOptions) {
            var _instance = this;
            this.webChannel = new WebSdk.WebChannelClient("smartcards", options);
            this.webChannel.onConnectionSucceed = () => { _instance.onConnectionSucceed(); };
            this.webChannel.onConnectionFailed = () => { _instance.onConnectionFailed(); };
            this.webChannel.onDataReceivedTxt = (data: string) => { _instance.onDataReceivedTxt(data); };
        }

        enumerateReaders(): Promise<string[]> {
            var _instance = this;
            return new Promise<string[]>(function (resolve, reject) {
                var command = new Command(Method.EnumerateReaders);
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        enumerateCards(): Promise<CardInfo[]> {
            var _instance = this;
            return new Promise<CardInfo[]>(function (resolve, reject) {
                var command = new Command(Method.EnumerateCards);
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        getCardInfo(reader: string): Promise<CardInfo> {
            var _instance = this;
            return new Promise<CardInfo>(function (resolve, reject) {
                var deviceParams = { Reader: reader };
                var command = new Command(Method.GetCardInfo, strToB64Url(JSON.stringify(deviceParams)));
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        getCardUid(reader: string): Promise<string> {
            var _instance = this;
            return new Promise<string>(function (resolve, reject) {
                var deviceParams = { Reader: reader };
                var command = new Command(Method.GetCardUID, strToB64Url(JSON.stringify(deviceParams)));
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        getCardAuthData(reader: string, pin?: string): Promise<string> {
            var _instance = this;
            return new Promise<string>(function (resolve, reject) {
                var deviceParams = { Reader: reader, PIN: pin ? pin : "" };
                var command = new Command(Method.GetDPCardAuthData, strToB64Url(JSON.stringify(deviceParams)));
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        getCardEnrollData(reader: string, pin?: string): Promise<string> {
            var _instance = this;
            return new Promise<string>(function (resolve, reject) {
                var deviceParams = { Reader: reader, PIN: pin ? pin : "" };
                var command = new Command(Method.GetDPCardEnrollData, strToB64Url(JSON.stringify(deviceParams)));
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        getCardObjectName(reader: string): Promise<string> {
            var _instance = this;
            return new Promise<string>(function (resolve, reject) {
                var deviceParams = { Reader: reader };
                var command = new Command(Method.GetCardObjectName, strToB64Url(JSON.stringify(deviceParams)));
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        subscribe(reader?: string): Promise<void> {
            var _instance = this;
            return new Promise<void>(function (resolve, reject) {
                var parameters = "";
                if (reader) {
                    var subscriptionParams = { Reader: reader };
                    parameters = strToB64Url(JSON.stringify(subscriptionParams));
                }
                var command = new Command(Method.Subscribe, parameters);
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        unsubscribe(reader?: string): Promise<void> {
            var _instance = this;
            return new Promise<void>(function (resolve, reject) {
                var parameters = "";
                if (reader) {
                    var subscriptionParams = { Reader: reader };
                    parameters = strToB64Url(JSON.stringify(subscriptionParams));
                }
                var command = new Command(Method.Unsubscribe, parameters);
                var request = new Request(command, resolve, reject);
                _instance.requests.push(request);
                if (_instance.webChannel.isConnected())
                    _instance.processQueue();
                else
                    _instance.webChannel.connect();
            });
        }

        private onConnectionSucceed(): void {
            this.processQueue();
        }

        private onConnectionFailed(): void {
            for (var i = 0; i < this.requests.length; i++) {
                this.requests[i].reject(new Error("Communication failure."));
            }
            this.requests = [];
            this.emit(new CommunicationFailed());
        }

        private onDataReceivedTxt(data: string): void {
            var message = <Message>JSON.parse(b64UrlToUtf8(data));
            if (message.Type === MessageType.Response) {
                var response = <Response>JSON.parse(b64UrlToUtf8(message.Data));
                this.processResponse(response);
            }
            else if (message.Type === MessageType.Notification) {
                var notification = <Notification>JSON.parse(b64UrlToUtf8(message.Data));
                this.processNotification(notification);
            }
        }

        private processQueue(): void {
            for (var i = 0; i < this.requests.length; i++) {
                if (this.requests[i].sent)
                    continue;
                this.webChannel.sendDataTxt(strToB64Url(JSON.stringify(this.requests[i].command)));
                this.requests[i].sent = true;
            }
        }

        private processResponse(response: Response): void {
            var request: Request | undefined;
            for (var i = 0; i < this.requests.length; i++) {
                if (!this.requests[i].sent)
                    continue;
                if (this.requests[i].command.Method === response.Method) {
                    request = this.requests[i];
                    this.requests.splice(i, 1);
                    break;
                }
            }
            if (request) {
                if (response.Method === Method.EnumerateReaders) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("EnumerateReaders: " + (response.Result >>> 0).toString(16)));
                    else {
                        var enumerateReadersResponse = <EnumerateReadersResponse>JSON.parse(b64UrlToUtf8(response.Data!));
                        request.resolve(JSON.parse(enumerateReadersResponse.Readers));
                    }
                }
                else if (response.Method === Method.EnumerateCards) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("EnumerateCards: " + (response.Result >>> 0).toString(16)));
                    else {
                        var enumerateCardsResponse = <EnumerateCardsResponse>JSON.parse(b64UrlToUtf8(response.Data!));
                        request.resolve(JSON.parse(enumerateCardsResponse.Cards));
                    }
                }
                else if (response.Method === Method.GetCardInfo) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("GetCardInfo: " + (response.Result >>> 0).toString(16)));
                    else {
                        var cardInfo = <CardInfo>JSON.parse(b64UrlToUtf8(response.Data!));
                        request.resolve(cardInfo);
                    }
                }
                else if (response.Method === Method.GetCardUID) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("GetCardUID: " + (response.Result >>> 0).toString(16)));
                    else {
                        var data = b64UrlTo64(response.Data!);
                        request.resolve(data);
                    }
                }
                else if (response.Method === Method.GetDPCardAuthData) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("GetDPCardAuthData: " + (response.Result >>> 0).toString(16)));
                    else {
                        var data = b64UrlToUtf8(response.Data!);
                        request.resolve(data);
                    }
                }
                else if (response.Method === Method.GetDPCardEnrollData) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("GetDPCardEnrollData: " + (response.Result >>> 0).toString(16)));
                    else {
                        var data = b64UrlToUtf8(response.Data!);
                        request.resolve(data);
                    }
                }
                else if (response.Method === Method.GetCardObjectName) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("GetCardObjectName: " + (response.Result >>> 0).toString(16)));
                    else {
                        var data = b64UrlTo64(response.Data!);
                        request.resolve(data);
                    }
                }
                else if (response.Method === Method.Subscribe) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("Subscribe: " + (response.Result >>> 0).toString(16)));
                    else
                        request.resolve();
                }
                else if (response.Method === Method.Unsubscribe) {
                    if (response.Result < 0 || response.Result > 2147483647)
                        request.reject(new Error("Unsubscribe: " + (response.Result >>> 0).toString(16)));
                    else
                        request.resolve();
                }
            }
        }

        private processNotification(notification: Notification): void {
            if (notification.Event === NotificationType.ReaderConnected) {
                this.emit(new ReaderConnected(notification.Reader));
            }
            else if (notification.Event === NotificationType.ReaderDisconnected) {
                this.emit(new ReaderDisconnected(notification.Reader));
            }
            else if (notification.Event === NotificationType.CardInserted) {
                this.emit(new CardInserted(notification.Reader, notification.Card!));
            }
            else if (notification.Event === NotificationType.CardRemoved) {
                this.emit(new CardRemoved(notification.Reader, notification.Card!));
            }
        }

        onReaderConnected?: Handler<ReaderConnected>;
        onReaderDisconnected?: Handler<ReaderDisconnected>;
        onCardInserted?: Handler<CardInserted>;
        onCardRemoved?: Handler<CardRemoved>;
        onCommunicationFailed?: Handler<CommunicationFailed>;

        on<E extends Event>(event: string, handler: Handler<E>): WebApi {
            if (!this.handlers[event])
                this.handlers[event] = [];
            this.handlers[event].push(handler as Handler<Event>);
            return this;
        }

        off(event?: string, handler?: Handler<Event>): WebApi {
            if (event) {
                var hh: Handler<Event>[] = this.handlers[event];
                if (hh) {
                    if (handler)
                        this.handlers[event] = hh.filter(h => h !== handler);
                    else
                        delete this.handlers[event];
                }
            }
            else
                this.handlers = {};
            return this;
        }

        protected emit(event: Event): void {
            if (!event) return;

            var eventName: string = event.type;
            var unicast: Handler<Event> = (this as any)["on" + eventName];
            if (unicast)
                this.invoke(unicast, event);

            var multicast: Handler<Event>[] = this.handlers[eventName];
            if (multicast)
                multicast.forEach(h => this.invoke(h, event));
        }

        private invoke(handler: Handler<Event>, event: Event) {
            try {
                handler(event);
            } catch (e) {
                console.error(e);
            }
        }
    }
}
