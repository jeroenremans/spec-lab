import { marked } from "marked";

const TAG_RE = /\[(TODO|REVIEW|REWORK|CLARIFY|COMMENT)(?:\|(AI|HUMAN))?\]([^\n]*)/g;
const HEX_RE = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

const TAG_CLASS = {
  TODO: "tag-todo",
  REVIEW: "tag-review",
  REWORK: "tag-rework",
  CLARIFY: "tag-clarify",
  COMMENT: "tag-comment",
};

export function applyTagHighlights(html) {
  return html.replace(
    /\[(TODO|REVIEW|REWORK|CLARIFY|COMMENT)(?:\|(AI|HUMAN))?\]([^<\n]*)/g,
    (_, tag, recipient, rest) => {
      const r = recipient || "AI";
      const badge = `<span class="tag-recipient tag-recipient-${r.toLowerCase()}">${r}</span>`;
      return `<span class="tag-inline ${TAG_CLASS[tag]}">${badge}<b>${tag}</b>${rest ? " " + esc(rest.trim()) : ""}</span>`;
    }
  );
}

export function applyColorSwatches(html) {
  return html.replace(HEX_RE, (hex) => {
    return `<span class="color-swatch" style="background:${hex}"></span>${hex}`;
  });
}

export function renderMarkdown(md) {
  const raw = marked.parse(md, { gfm: true, breaks: false });
  return applyColorSwatches(applyTagHighlights(raw));
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderVTT(text) {
  const blocks = text.split(/\n\n+/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const tsIdx = lines.findIndex((l) => /\d+:\d+.*-->/.test(l));
    if (tsIdx < 0) continue;
    const tsLine = lines[tsIdx];
    const startRaw = tsLine.split("-->")[0].trim();
    const fmtTs = (t) => {
      const p = t.split(":");
      const s = Math.floor(parseFloat(p[p.length - 1]));
      const m = parseInt(p.length >= 2 ? p[p.length - 2] : 0);
      const h = parseInt(p.length >= 3 ? p[p.length - 3] : 0);
      return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    const ts = fmtTs(startRaw);
    const rawContent = lines.slice(tsIdx + 1).join(" ").trim();
    if (!rawContent) continue;
    let speaker = "", content = rawContent;
    const vMatch = rawContent.match(/^<v ([^>]+)>([\s\S]*)/);
    if (vMatch) {
      speaker = vMatch[1].trim();
      content = vMatch[2].replace(/<\/v>/g, "").replace(/<[^>]+>/g, "").trim();
    } else {
      const colonMatch = rawContent.match(/^([^:<]{2,40}):\s+(.*)/);
      if (colonMatch) { speaker = colonMatch[1].trim(); content = colonMatch[2].trim(); }
      else content = rawContent.replace(/<[^>]+>/g, "").trim();
    }
    if (content) cues.push({ ts, speaker, content });
  }

  const rows = [];
  for (const cue of cues) {
    const last = rows[rows.length - 1];
    if (last && last.speaker === cue.speaker) {
      last.lines.push(cue.content);
    } else {
      rows.push({ ts: cue.ts, speaker: cue.speaker, lines: [cue.content] });
    }
  }

  const speakerBgs = {};
  const BG_POOL = ["#f4f5f7", "#ffffff"];
  let bgIdx = 0;
  const getBg = (s) => { if (!(s in speakerBgs)) speakerBgs[s] = BG_POOL[bgIdx++ % 2]; return speakerBgs[s]; };
  const speakers = [...new Set(rows.map((r) => r.speaker))];

  return `<div style="max-width:720px">
    <div class="transcript-meta">${rows.length} segments · ${speakers.length} speaker${speakers.length !== 1 ? "s" : ""}: ${speakers.map((s) => `<b>${esc(s)}</b>`).join(", ")}</div>
    ${rows
      .map((r) => {
        const bg = getBg(r.speaker);
        return `<div class="transcript-row" style="background:${bg};border:${bg === "#ffffff" ? "1px solid var(--border)" : "none"}">
          <div><span class="transcript-speaker">${esc(r.speaker)}</span><span class="transcript-ts">${r.ts}</span></div>
          ${r.lines.map((l) => `<p class="transcript-line">${esc(l)}</p>`).join("")}
        </div>`;
      })
      .join("")}
  </div>`;
}

export function renderJSON(text) {
  try {
    const parsed = JSON.parse(text);
    return `<div class="json-viewer">${esc(JSON.stringify(parsed, null, 2))}</div>`;
  } catch {
    return `<div class="json-viewer">${esc(text)}</div>`;
  }
}

export function paragraphDiff(oldMd, newMd) {
  const oldParts = oldMd.split(/\n\n+/);
  const newParts = newMd.split(/\n\n+/);
  const result = [];
  const oldSet = new Set(oldParts);
  const newSet = new Set(newParts);
  let oi = 0, ni = 0;
  while (oi < oldParts.length || ni < newParts.length) {
    const o = oldParts[oi], n = newParts[ni];
    if (oi >= oldParts.length) { result.push({ op: "add", val: n }); ni++; }
    else if (ni >= newParts.length) { result.push({ op: "del", val: o }); oi++; }
    else if (o === n) { result.push({ op: "equal", val: o + "\n\n" }); oi++; ni++; }
    else if (!newSet.has(o)) { result.push({ op: "del", val: o }); oi++; }
    else if (!oldSet.has(n)) { result.push({ op: "add", val: n }); ni++; }
    else { result.push({ op: "del", val: o }); oi++; }
  }
  return result;
}
