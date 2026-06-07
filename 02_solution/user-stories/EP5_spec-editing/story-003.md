# S5.3 — Tag content while reading (without entering edit mode)

**Epic:** EP5 — Spec Editing  
**Priority:** Should-have

---

**As a** BA,  
**I want to** select text in the viewer and tag it directly,  
**so that** I can flag content for review without opening the full editor.

**Acceptance intent:** Selecting text in view mode shows a floating tag bar. Clicking a tag prepends `[TAGNAME] ` to that line in the raw markdown and auto-saves. The view refreshes immediately showing the new badge. Sidebar "To Review" updates.

**Dependencies:** S5.1; S4.2.

**Non-goals:** Inline annotation threads; multi-line tag spanning.
