# Brainstorm — Theme Switcher

## Context
8 UI mockups zijn gemaakt voor de Spec Workbench app. Gebruiker kiest 4 favorieten:
- UI 01: Teal Corporate (licht, professioneel, huidige richting)
- UI 02: Midnight (full dark mode, VS Code energie)
- UI 07: Warm Paper (crème, serif, leesoptimaal)
- UI 08: Bold Agency (teal + amber, sterk, agency-feel)

## Gewenst
Een theme switcher in de app waarmee gebruiker kan wisselen tussen deze 4 visuele thema's.

## Randvoorwaarden
- Keuze persisteren (localStorage)
- Geen herstart vereist — live toepassen
- Alle 4 thema's volledig functioneel (niet alleen cosmetic)
- Thema van toepassing op: topnav, sidebar, content area, editor, modals, tags
- Thema-instelling zichtbaar/bereikbaar in de topnav of settings
- Werkt op macOS en Windows/WSL (lokale app, geen CDN)

## Technisch context
- Frontend: Vite + vanilla JS (geen framework)
- Backend: Flask (Python 3.13), port 3301
- Thema's geïmplementeerd als CSS custom properties op :root of [data-theme="..."]
- Mockups bestaan als referentie in 00_intake/ui-concepts/
