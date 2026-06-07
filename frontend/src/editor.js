import EasyMDE from "easymde";
import { marked } from "marked";

let _editor = null;

export function isEditing() {
  return document.getElementById("wysiwyg-wrap").classList.contains("active");
}

export function getEditor() {
  return _editor;
}

export function destroyEditor() {
  if (_editor) {
    try { _editor.toTextArea(); } catch (_) {}
    _editor = null;
  }
  document.getElementById("wysiwyg-editor").innerHTML = "";
}

export function createEditor(initialValue) {
  const el = document.getElementById("wysiwyg-editor");
  el.innerHTML = "";
  const ta = document.createElement("textarea");
  ta.id = "easymde-ta";
  el.appendChild(ta);

  _editor = new EasyMDE({
    element: ta,
    initialValue,
    spellChecker: false,
    autosave: { enabled: false },
    status: false,
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "code", "table", "|",
      "unordered-list", "ordered-list", "|",
      "link", "|",
      "preview", "side-by-side", "|",
      "undo", "redo",
    ],
    previewRender: (md) => marked.parse(md),
    renderingConfig: { singleLineBreaks: false },
  });

  _editor.codemirror.focus();
  return _editor;
}

export function insertTag(tag) {
  if (!_editor) return;
  const cm = _editor.codemirror;
  const cursor = cm.getCursor();
  cm.replaceRange(`[${tag}] `, cursor);
  cm.focus();
}

export function insertTagAroundSelection(tag) {
  if (!_editor) return;
  const cm = _editor.codemirror;
  const sel = cm.getSelection();
  if (sel) {
    cm.replaceSelection(`[${tag}] ${sel}`);
  } else {
    cm.replaceRange(`[${tag}] `, cm.getCursor());
  }
  cm.focus();
}

export function setupFloatingTagBar(editor) {
  const bar = document.getElementById("float-tag-bar");
  editor.codemirror.on("cursorActivity", () => {
    const sel = editor.codemirror.getSelection();
    if (sel && sel.length > 0) {
      const coords = editor.codemirror.cursorCoords(false, "window");
      bar.style.left = `${coords.left}px`;
      bar.style.top = `${coords.top - 40}px`;
      bar.classList.add("visible");
    } else {
      bar.classList.remove("visible");
    }
  });
}
