// In vanilla JS, the `@digitalpersona/card` is impoerted using the `<script>` tag, and
// the `dp` object is available as a global variable.

const { capture } = dp.card;


const form = /** @type {!HTMLFormElement} */
    (document.getElementById('capture'));

const startButton = /** @type {!HTMLButtonElement} */
    (document.getElementById('start'));
const cancelButton  = /** @type {!HTMLButtonElement} */
    (document.getElementById('cancel'));
const feedbackView = /** @type {!HTMLDivElement} */
    (document.getElementById('feedback'));
const errorView = /** @type {!HTMLDivElement} */
    (document.getElementById('error'));
const resultView = /** @type {!HTMLDivElement} */
    (document.getElementById('result'));
const rawMessages = /** @type {!HTMLInputElement} */
    (document.getElementById('rawMessages'));

// [Capture] button click handler
startButton.onclick = async () =>
{
    const ac = new AbortController();

    try {
        resultView.innerText = ""

        setCaptureActive(true, ac);
        updateFeedbackView()
        updateErrorView()

        const data = await capture(form.purpose.value, {
            cardType: form.cardType.value,
            signal: ac.signal,
            onFeedback: updateFeedbackView,
            channelOptions: { debug: true },
            debug: true
        });

        resultView.innerText = JSON.stringify(data, null, 2)
    }
    catch(e) {
        updateErrorView(e);
    }
    finally {
        setCaptureActive(false);
        updateFeedbackView()
    }
};

// Update state of [Capture] and [Cancel] buttons in a consistent way,
// and attach a cancellation handler.
function setCaptureActive(capturing, ac)
{
    form?.classList.toggle('started', capturing)
    startButton.disabled = capturing;
    cancelButton.disabled = !capturing;
    cancelButton.onclick = (capturing && ac) ?
        () => ac.abort() : null
}

// Update a user feedback view
function updateFeedbackView(feedback) {
    feedbackView.hidden = !feedback;
    feedbackView.innerText = translate(feedback) || '';
}

// Update an error view
function updateErrorView(error) {
    errorView.hidden = !error;
    errorView.innerText = translate(error) || '';
}

// Translate feedbacks/errors to human-readable prompts/notifications.
// NOTE: this example show use of the Angular's `$localize` taggged
// template literals for API message localization; other frameworks
// may use their own localization serices.
function translate(msgOrError){
    if (!msgOrError) return ""
    const { message, code } = msgOrError
    return (rawMessages.checked) ?
        getRawMessage(message, code) :
        getLocalizedMesage(message, code)
}

function getLocalizedMesage(message, code) {
    switch(message) {
        // feedbacks
        case "Starting"             : return `Starting...`;
        case "Paused"               : return `Paused, click on the page to resume.`;
        case "ConnectReader"        : return `Connect a card reader.`;
        case "UseCard"              : return `Tap a card.`;
        case "UseDifferentCard"     : return `Use a different card.`;
        case "UseDifferentCardType" : return `Use a card of different type.`;
        case "UseSingleCard"        : return `Use a single card.`;
        // // errors
        case "BadVersion"           : return `Incompatible client version.`;
        case "BadConnection"        : return `Connection failure.`;
        case "BadResponse"          : return `Service failure.`;
        case "Aborted"              : return `The operation was aborted.`;
        // Show unknown platform-generated messages with codes "as-is".
        // The message will be in a system locale, not a browser locale.
        default:
            return getRawMessage(message, code)
    }

}

function getRawMessage(message, code) {
    return `"${message || `Oops!`}" (${code != null ? code.toString(16) : "n/a"})`;
}
