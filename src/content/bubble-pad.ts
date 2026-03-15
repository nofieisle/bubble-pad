import cssText from "./styles.css?raw";

export class BubblePad {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private container: HTMLDivElement;
  private textarea: HTMLTextAreaElement;
  private charCount: HTMLSpanElement;
  private copyBtn: HTMLButtonElement;
  private visible = false;
  private previousFocus: HTMLElement | null = null;

  // Drag state
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Resize state
  private isResizing = false;
  private resizeEdge = "";
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartRect = { left: 0, top: 0, width: 0, height: 0 };
  private static readonly MIN_WIDTH = 250;
  private static readonly MIN_HEIGHT = 180;

  constructor() {
    this.host = document.createElement("div");
    this.host.id = "bubble-pad-host";
    this.shadow = this.host.attachShadow({ mode: "closed", delegatesFocus: true });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = cssText;
    this.shadow.appendChild(style);

    // Build UI
    this.container = this.createContainer();
    this.textarea = this.container.querySelector(".bp-textarea") as HTMLTextAreaElement;
    this.charCount = this.container.querySelector(".bp-char-count") as HTMLSpanElement;
    this.copyBtn = this.container.querySelector(".bp-copy-btn") as HTMLButtonElement;
    this.shadow.appendChild(this.container);

    this.setupEventListeners();
    document.body.appendChild(this.host);
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "bp-container";
    container.innerHTML = `
      <div class="bp-resize bp-resize-n"></div>
      <div class="bp-resize bp-resize-s"></div>
      <div class="bp-resize bp-resize-e"></div>
      <div class="bp-resize bp-resize-w"></div>
      <div class="bp-resize bp-resize-ne"></div>
      <div class="bp-resize bp-resize-nw"></div>
      <div class="bp-resize bp-resize-se"></div>
      <div class="bp-resize bp-resize-sw"></div>
      <div class="bp-header">
        <span class="bp-title">Bubble Pad</span>
        <div class="bp-actions">
          <button class="bp-copy-btn" title="Copy to clipboard">Copy</button>
          <button class="bp-clear-btn" title="Clear text">Clear</button>
          <button class="bp-close-btn" title="Close">&times;</button>
        </div>
      </div>
      <textarea class="bp-textarea" placeholder="Draft your message here..."></textarea>
      <div class="bp-footer">
        <span class="bp-char-count">0 chars</span>
      </div>
    `;
    return container;
  }

  private setupEventListeners(): void {
    const header = this.container.querySelector(".bp-header") as HTMLDivElement;
    const closeBtn = this.container.querySelector(".bp-close-btn") as HTMLButtonElement;
    const clearBtn = this.container.querySelector(".bp-clear-btn") as HTMLButtonElement;

    // Text input
    this.textarea.addEventListener("input", () => {
      this.updateCharCount();
    });

    // Copy
    this.copyBtn.addEventListener("click", () => {
      this.copyText();
    });

    // Clear
    clearBtn.addEventListener("click", () => {
      this.textarea.value = "";
      this.updateCharCount();
      this.textarea.focus();
    });

    // Close
    closeBtn.addEventListener("click", () => {
      this.hide(false);
    });

    // Drag
    header.addEventListener("mousedown", (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "BUTTON") return;
      this.isDragging = true;
      const rect = this.container.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    // Resize handles
    this.container.querySelectorAll<HTMLDivElement>(".bp-resize").forEach((handle) => {
      handle.addEventListener("mousedown", (e: MouseEvent) => {
        this.isResizing = true;
        this.resizeEdge = handle.className.replace("bp-resize bp-resize-", "");
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        const rect = this.container.getBoundingClientRect();
        this.resizeStartRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        e.preventDefault();
      });
    });

    // Document-level listeners for drag and resize
    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (this.isDragging) {
        const x = e.clientX - this.dragOffsetX;
        const y = e.clientY - this.dragOffsetY;
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
        this.container.style.right = "auto";
        this.container.style.bottom = "auto";
      } else if (this.isResizing) {
        this.handleResize(e);
      }
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.isResizing = false;
    });

    // Prevent page shortcuts while typing + Esc to close
    this.textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.hide(false);
        return;
      }
      e.stopPropagation();
    });
  }

  private handleResize(e: MouseEvent): void {
    const dx = e.clientX - this.resizeStartX;
    const dy = e.clientY - this.resizeStartY;
    const { left, top, width, height } = this.resizeStartRect;
    const edge = this.resizeEdge;

    let newLeft = left;
    let newTop = top;
    let newWidth = width;
    let newHeight = height;

    if (edge.includes("e")) {
      newWidth = Math.max(BubblePad.MIN_WIDTH, width + dx);
    }
    if (edge.includes("w")) {
      const w = Math.max(BubblePad.MIN_WIDTH, width - dx);
      newLeft = left + (width - w);
      newWidth = w;
    }
    if (edge.includes("s")) {
      newHeight = Math.max(BubblePad.MIN_HEIGHT, height + dy);
    }
    if (edge.includes("n")) {
      const h = Math.max(BubblePad.MIN_HEIGHT, height - dy);
      newTop = top + (height - h);
      newHeight = h;
    }

    this.container.style.left = `${newLeft}px`;
    this.container.style.top = `${newTop}px`;
    this.container.style.right = "auto";
    this.container.style.bottom = "auto";
    this.container.style.width = `${newWidth}px`;
    this.container.style.height = `${newHeight}px`;
  }

  private updateCharCount(): void {
    const len = this.textarea.value.length;
    this.charCount.textContent = `${len} char${len !== 1 ? "s" : ""}`;
  }

  private async copyText(): Promise<void> {
    const text = this.textarea.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const original = this.copyBtn.textContent;
      this.copyBtn.textContent = "Copied!";
      this.copyBtn.classList.add("bp-copied");
      setTimeout(() => {
        this.copyBtn.textContent = original;
        this.copyBtn.classList.remove("bp-copied");
      }, 1500);
    } catch {
      // Fallback for contexts where clipboard API is restricted
      this.textarea.select();
      document.execCommand("copy");
    }
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private show(): void {
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.visible = true;
    this.container.classList.add("bp-visible");
    // Reset position to default
    this.container.style.left = "";
    this.container.style.top = "";
    this.container.style.right = "";
    this.container.style.bottom = "";
    setTimeout(() => {
      this.host.focus();
      this.textarea.focus();
    }, 50);
  }

  private hide(insertText = true): void {
    this.visible = false;
    this.container.classList.remove("bp-visible");
    const text = this.textarea.value;
    if (insertText && text) {
      navigator.clipboard.writeText(text).catch(() => {});
      if (this.previousFocus) {
        this.previousFocus.focus();
        this.insertTextAtTarget(this.previousFocus, text);
      }
      this.textarea.value = "";
      this.updateCharCount();
    }
    this.previousFocus = null;
  }

  private insertTextAtTarget(target: HTMLElement, text: string): void {
    // input / textarea
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      target.setRangeText(text, start, end, "end");
      target.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // contenteditable
    if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        target.append(text);
      }
      target.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
  }
}
