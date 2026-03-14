import cssText from "./styles.css?raw";

export class BubblePad {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private container: HTMLDivElement;
  private textarea: HTMLTextAreaElement;
  private charCount: HTMLSpanElement;
  private copyBtn: HTMLButtonElement;
  private visible = false;

  // Drag state
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  constructor() {
    this.host = document.createElement("div");
    this.host.id = "bubble-pad-host";
    this.shadow = this.host.attachShadow({ mode: "closed" });

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
      this.hide();
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

    // Use document-level listeners for smooth dragging
    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (!this.isDragging) return;
      const x = e.clientX - this.dragOffsetX;
      const y = e.clientY - this.dragOffsetY;
      this.container.style.left = `${x}px`;
      this.container.style.top = `${y}px`;
      this.container.style.right = "auto";
      this.container.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // Prevent page shortcuts while typing
    this.textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      e.stopPropagation();
    });
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
    this.visible = true;
    this.container.classList.add("bp-visible");
    // Reset position to default
    this.container.style.left = "";
    this.container.style.top = "";
    this.container.style.right = "";
    this.container.style.bottom = "";
    this.textarea.focus();
  }

  private hide(): void {
    this.visible = false;
    this.container.classList.remove("bp-visible");
  }
}
