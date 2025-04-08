import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CardType, Purpose, capture, Feedback, ApiError } from '@digitalpersona/card';


@Component({
  selector: 'app-root',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'default';

  inputForm = new FormGroup({
    purpose: new FormControl<Purpose>('enroll', { nonNullable: true }),
    cardType: new FormControl<CardType | ''>('', { nonNullable: true })
  });

  outputForm = new FormGroup({
    showRawMessages: new FormControl(false, { nonNullable: true }),
  })

  result: string = "";
  feedback: string = 'Click "Start" to capture a card';
  error: string = "";

  capturing: boolean = false;
  #ac?: AbortController

  async start() {
    if (this.capturing) return;

    this.#ac = new AbortController();

    const { purpose, cardType } = this.inputForm.value;
    const { showRawMessages } = this.outputForm.value;
    try {
        this.capturing = true;

        this.result = this.error = '';
        this.feedback = 'Click "Cancel" to stop capturing';

        const data = await capture(purpose!, {
            cardType,
            signal: this.#ac.signal,
            onFeedback: (fb) => { this.feedback = translate(fb, showRawMessages); },
            channelOptions: { debug: true },
            debug: true
        });

        this.result = JSON.stringify(data, null, 2);
    }
    catch(e: any) {
        this.error = translate(e, showRawMessages);
    }
    finally {
        this.capturing = false;
        this.feedback = 'Click "Start" to capture a card';
    }
  }

  cancel() {
    if (this.capturing && this.#ac) {
      this.#ac.abort();
      this.#ac = undefined;
    }
  }
}

// Translate feedbacks/errors to human-readable prompts/notifications.
// NOTE: this example show use of the Angular's `$localize` taggged
// template literals for API message localization; other frameworks
// may use their own localization serices.
function translate(msgOrError: Feedback | ApiError, rawMessages?: boolean) {
    if (!msgOrError) return ""
    const { message, code } = msgOrError
    return rawMessages ?
        getRawMessage(message, code) :
        getLocalizedMesage(message, code)
}

function getLocalizedMesage(message: string, code?: number) {
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
        case "unknown"              : return 'The operation failed. Check you have a latest version of the HID Authentication Device Client installed.';
        // Show unknown platform-generated messages with codes "as-is".
        // The message will be in a system locale, not a browser locale.
        default:
            return getRawMessage(message, code)
    }

}

function getRawMessage(message: string, code?: number) {
    return `"${message || `Oops!`}" (${code != null ? code.toString(16) : "n/a"})`;
}
