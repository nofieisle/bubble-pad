const g=`:host {
  all: initial;
}

.bp-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 520px;
  height: 300px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  color: #1f2937;
  z-index: 2147483647;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.bp-container.bp-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Resize handles */
.bp-resize {
  position: absolute;
  z-index: 1;
}

.bp-resize-n {
  top: 0; left: 6px; right: 6px; height: 6px;
  cursor: n-resize;
}

.bp-resize-s {
  bottom: 0; left: 6px; right: 6px; height: 6px;
  cursor: s-resize;
}

.bp-resize-e {
  right: 0; top: 6px; bottom: 6px; width: 6px;
  cursor: e-resize;
}

.bp-resize-w {
  left: 0; top: 6px; bottom: 6px; width: 6px;
  cursor: w-resize;
}

.bp-resize-ne {
  top: 0; right: 0; width: 6px; height: 6px;
  cursor: ne-resize;
}

.bp-resize-nw {
  top: 0; left: 0; width: 6px; height: 6px;
  cursor: nw-resize;
}

.bp-resize-se {
  bottom: 0; right: 0; width: 6px; height: 6px;
  cursor: se-resize;
}

.bp-resize-sw {
  bottom: 0; left: 0; width: 6px; height: 6px;
  cursor: sw-resize;
}

/* Header */
.bp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.bp-header:active {
  cursor: grabbing;
}

.bp-title {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.bp-actions {
  display: flex;
  gap: 4px;
}

.bp-actions button {
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.bp-copy-btn {
  background: #3b82f6;
  color: #ffffff;
}

.bp-copy-btn:hover {
  background: #2563eb;
}

.bp-copy-btn.bp-copied {
  background: #10b981;
}

.bp-clear-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.bp-clear-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.bp-close-btn {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 16px;
  line-height: 1;
  padding: 4px 8px;
}

.bp-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Textarea */
.bp-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 12px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  background: #ffffff;
}

.bp-textarea::placeholder {
  color: #9ca3af;
}

/* Footer */
.bp-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.bp-char-count {
  font-size: 11px;
  color: #9ca3af;
}
`,r=class r{constructor(){this.visible=!1,this.previousFocus=null,this.isDragging=!1,this.dragOffsetX=0,this.dragOffsetY=0,this.isResizing=!1,this.resizeEdge="",this.resizeStartX=0,this.resizeStartY=0,this.resizeStartRect={left:0,top:0,width:0,height:0},this.host=document.createElement("div"),this.host.id="bubble-pad-host",this.shadow=this.host.attachShadow({mode:"closed",delegatesFocus:!0});const e=document.createElement("style");e.textContent=g,this.shadow.appendChild(e),this.container=this.createContainer(),this.textarea=this.container.querySelector(".bp-textarea"),this.charCount=this.container.querySelector(".bp-char-count"),this.copyBtn=this.container.querySelector(".bp-copy-btn"),this.shadow.appendChild(this.container),this.setupEventListeners(),document.body.appendChild(this.host)}createContainer(){const e=document.createElement("div");return e.className="bp-container",e.innerHTML=`
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
    `,e}setupEventListeners(){const e=this.container.querySelector(".bp-header"),n=this.container.querySelector(".bp-close-btn"),i=this.container.querySelector(".bp-clear-btn");this.textarea.addEventListener("input",()=>{this.updateCharCount()}),this.copyBtn.addEventListener("click",()=>{this.copyText()}),i.addEventListener("click",()=>{this.textarea.value="",this.updateCharCount(),this.textarea.focus()}),n.addEventListener("click",()=>{this.hide(!1)}),e.addEventListener("mousedown",t=>{if(t.target.tagName==="BUTTON")return;this.isDragging=!0;const s=this.container.getBoundingClientRect();this.dragOffsetX=t.clientX-s.left,this.dragOffsetY=t.clientY-s.top,t.preventDefault()}),this.container.querySelectorAll(".bp-resize").forEach(t=>{t.addEventListener("mousedown",s=>{this.isResizing=!0,this.resizeEdge=t.className.replace("bp-resize bp-resize-",""),this.resizeStartX=s.clientX,this.resizeStartY=s.clientY;const o=this.container.getBoundingClientRect();this.resizeStartRect={left:o.left,top:o.top,width:o.width,height:o.height},s.preventDefault()})}),document.addEventListener("mousemove",t=>{if(this.isDragging){const s=t.clientX-this.dragOffsetX,o=t.clientY-this.dragOffsetY;this.container.style.left=`${s}px`,this.container.style.top=`${o}px`,this.container.style.right="auto",this.container.style.bottom="auto"}else this.isResizing&&this.handleResize(t)}),document.addEventListener("mouseup",()=>{this.isDragging=!1,this.isResizing=!1}),this.textarea.addEventListener("keydown",t=>{if(t.key==="Escape"){this.hide(!1);return}t.stopPropagation()})}handleResize(e){const n=e.clientX-this.resizeStartX,i=e.clientY-this.resizeStartY,{left:t,top:s,width:o,height:c}=this.resizeStartRect,h=this.resizeEdge;let u=t,f=s,l=o,p=c;if(h.includes("e")&&(l=Math.max(r.MIN_WIDTH,o+n)),h.includes("w")){const a=Math.max(r.MIN_WIDTH,o-n);u=t+(o-a),l=a}if(h.includes("s")&&(p=Math.max(r.MIN_HEIGHT,c+i)),h.includes("n")){const a=Math.max(r.MIN_HEIGHT,c-i);f=s+(c-a),p=a}this.container.style.left=`${u}px`,this.container.style.top=`${f}px`,this.container.style.right="auto",this.container.style.bottom="auto",this.container.style.width=`${l}px`,this.container.style.height=`${p}px`}updateCharCount(){const e=this.textarea.value.length;this.charCount.textContent=`${e} char${e!==1?"s":""}`}async copyText(){const e=this.textarea.value;if(e)try{await navigator.clipboard.writeText(e);const n=this.copyBtn.textContent;this.copyBtn.textContent="Copied!",this.copyBtn.classList.add("bp-copied"),setTimeout(()=>{this.copyBtn.textContent=n,this.copyBtn.classList.remove("bp-copied")},1500)}catch{this.textarea.select(),document.execCommand("copy")}}toggle(){if(this.visible){const e=document.activeElement;this.host===e||this.host.contains(e)||this.shadow.activeElement!=null?this.hide():(this.previousFocus=e,this.host.focus(),this.textarea.focus())}else this.show()}show(){this.previousFocus=document.activeElement,this.visible=!0,this.container.classList.add("bp-visible"),this.container.style.left="",this.container.style.top="",this.container.style.right="",this.container.style.bottom="",setTimeout(()=>{this.host.focus(),this.textarea.focus()},50)}hide(e=!0){this.visible=!1,this.container.classList.remove("bp-visible");const n=this.textarea.value;e&&n&&(navigator.clipboard.writeText(n).catch(()=>{}),this.previousFocus&&(this.previousFocus.focus(),this.insertTextAtTarget(this.previousFocus,n)),this.textarea.value="",this.updateCharCount()),this.previousFocus=null}insertTextAtTarget(e,n){if(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement){const i=e.selectionStart??e.value.length,t=e.selectionEnd??e.value.length;e.setRangeText(n,i,t,"end"),e.dispatchEvent(new Event("input",{bubbles:!0}));return}if(e.isContentEditable){const i=window.getSelection();if(i&&i.rangeCount>0){const t=i.getRangeAt(0);t.deleteContents(),t.insertNode(document.createTextNode(n)),t.collapse(!1),i.removeAllRanges(),i.addRange(t)}else e.append(n);e.dispatchEvent(new Event("input",{bubbles:!0}));return}}};r.MIN_WIDTH=250,r.MIN_HEIGHT=180;let b=r,d=null;function v(){return d||(d=new b),d}chrome.runtime.onMessage.addListener(x=>{x.action==="toggle-bubble-pad"&&v().toggle()});
