// In vanilla JS, the `@digitalpersona/card` and `@digitalpersona/websdk` are
// imported using the `<script>` tag, and the `Card` and `WebSdk` objects are
// available as global variables. Typings are available via the `<reference>`
// triple-slash directive (https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)

/// <reference types="@digitalpersona/websdk" />
/// <reference types="@digitalpersona/card" />

// Little HTML helper
const $ = (selector, root) => typeof selector === "string" ?
    (root ?? document).querySelector(selector) :
    selector;

// HTML elements
const startButton = $("#start");
const stopButton  = $("#stop");

const api = new Card.WebApi({
    debug: true,
});
api.onReaderConnected = onReaderConnected.bind(this);
api.onReaderDisconnected = onReaderDisconnected.bind(this);
api.onCardInserted = onCardInserted.bind(this);
api.onCardRemoved = onCardRemoved.bind(this);
api.onCommunicationFailed = onCommunicationFailed.bind(this);

// State variables
var capturing = false;

startButton.onclick = startCapture;
stopButton.onclick = stopCapture;
window.onload = startCapture;

// Reader event handlers and status updates

async function onReaderConnected(event) {
    console.log(`Reader ${event.Reader} is connected`);
    await refreshReadersView();
}

async function onReaderDisconnected(event) {
    console.log(`Reader ${event.Reader} is disconnected`);
    await refreshReadersView();
}

async function refreshReadersView() {
    try {
        const readersList = $("#readers");
        const readers = await api.enumerateReaders();
        clearItems(readersList);
        for (const reader of readers) {
            addItem(readersList, { name: reader });
        }
    } catch (error) {
        handleError(error);
    }
}

// Card event handlers and status updates

async function onCardInserted(event) {
    handleError();
    console.log(`Card ${event.Card} is inserted into reader ${event.Reader}`);
    try {
        // get card type and other info
        const card = await api.getCardInfo(event.Reader);
        if (!card) return; // the card was removed too early

        // for smartcards, obtain PIN from the user first
        const { pin } = (card.Type === Card.CardType.Contact) ?
            await showDialog("#pin") : {};

        // get the rest of card data
        const uid = await api.getCardUid(card.Reader);
        const objectName = await api.getCardObjectName(card.Reader);
        const enrollData = await api.getCardEnrollData(card.Reader, pin);
        const authData = await api.getCardAuthData(card.Reader, pin);

        addItem("#cards",
            {
                time        : (new Date()).toLocaleTimeString(),
                uid         : {
                    base64: uid,
                    hex:  hex(atob(uid)).substring(0, 16),
                },
                objectName  : {
                    base64: objectName,
                    text: atob(objectName)
                },
                info        : card,
                enrollData  : JSON.parse(enrollData),
                authData    : JSON.parse(authData),
            },
            item => requestAnimationFrame(() => item.setAttribute("open", ""))
        );

    }
    catch (error) {
        handleError(error);
    }
}

async function onCardRemoved(event) {
    console.log(`Card ${event.Card} is removed from reader ${event.Reader}`);
}

async function onCommunicationFailed(event) {
    handleError(event.error);
}

// Capture control methods and status updates

async function startCapture() {
    if (capturing) return;
    try {
        clearItems("#cards");
        await api.subscribe();
        setCaptureActive(true);
    } catch (error) {
        handleError(error);
    }
}

async function stopCapture() {
    if (!capturing) return;
    try {
        await api.unsubscribe();
        setCaptureActive(false);
    } catch (error) {
        handleError(error);
    }
}

function setCaptureActive(active) {
    capturing = active;
    $("#captureControl").toggleAttribute("active", active);
}

// Other status methods

function handleError(error) {
    $("#error").innerHTML = error?.message || error?.type || "";
}

// HTML view helpers

async function showDialog(id, defaultValue = {}) {
    return new Promise((resolve) => {
        const dialog = $(id);
        const form = $("*", dialog);
        form.reset();

        dialog.onclose = () => {
            const data = Object.fromEntries(new FormData(form).entries());
            resolve(dialog.returnValue === "ok" ? data : defaultValue);
        }
        dialog.showModal();
    });
}

// Data conversion functions

function hex(str) {
    return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

// Data transfer functions

const isControl = el => ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);

// Set data to HTML elements, using the `name` attribute as a JSON path
function setData(element, data) {
    for (let child of element.children) {
        if (child.hasAttribute('name')) {
            const jsonPath = child.getAttribute('name');
            let value = jsonPath.split('.').reduce((o, k) => (o || {})[k], data);
            if (typeof value === "object") value = JSON.stringify(value, null, 2);
            if (isControl(child)) {
                child.value = value;
            } else {
                child.innerText = value;
            }
        }
        setData(child, data);
    }
}

// Item list functions

// Add an item to the list, using the `item-template` attribute as a template reference
// and the `name` attribute as a JSON path to set data
function addItem(list, itemData, afterInsert) {
    const container = $(list);
    const itemTemplate = $(container.getAttribute("item-template"));
    const node = itemTemplate.content.cloneNode(true);
    setData(node, itemData);
    container.insertBefore(node, container.firstChild);
    afterInsert ? afterInsert(container.firstElementChild) : void(0);
}

function clearItems(list) {
    const container = $(list);
    container.textContent = "";
}
