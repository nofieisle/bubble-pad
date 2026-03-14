import { BubblePad } from "./bubble-pad";

let bubblePad: BubblePad | null = null;

function getBubblePad(): BubblePad {
  if (!bubblePad) {
    bubblePad = new BubblePad();
  }
  return bubblePad;
}

chrome.runtime.onMessage.addListener((message: { action: string }) => {
  if (message.action === "toggle-bubble-pad") {
    getBubblePad().toggle();
  }
});
