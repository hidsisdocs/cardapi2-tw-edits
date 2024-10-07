const { capture } = 'dp.card';


const form = document.getElementById('capture');

const startButton = document.getElementById('start');
const cancelButton  = document.getElementById('cancel');
const feedbackView = document.getElementById('feedback');
const errorView = document.getElementById('error');

// [Capture] button click handler
startButton.onclick = async () =>
{
    const ac = new AbortController();

    try {
        setCaptureActive(true, ac);
        updateFeedbackView()
        updateErrorView()

        const data = await dp.card.capture(form.purpose.value, {
            cardType: form.cardType.value,
            signal: ac.signal,
            onFeedback: updateFeedbackView,
            channelOptions: { debug: true },
            debug: true
        });

        // TODO: show card data
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
    if (!message) return "";
    switch(message) {
        // feedbacks
        case "Starting"             : return `Starting...`;
        case "Paused"               : return `Paused, click on the page to resume.`;
        case "ConnectReader"        : return `Connect a card reader.`;
        case "UseCard"              : return `Tap a card.`;
        case "UseDifferentCard"     : return `Use a different card.`;
        case "UseDifferentCardType" : return `Use a card of different type.`;
        case "UseSingleCard"        : return `Use a single card.`;
        // errors
        case "BadVersion"           : return `Incompatible client version.`;
        case "BadConnection"        : return `Connection failure.`;
        case "BadResponse"          : return `Service failure.`;
        case "Aborted"              : return `The operation was aborted.`;
        // Show unknown platform-generated messages with codes "as-is".
        // The message will be in a system locale, not a browser locale.
        default:
            return `${message || `Oops!`} Code: ${code || "N/A"}`;
    }
}
