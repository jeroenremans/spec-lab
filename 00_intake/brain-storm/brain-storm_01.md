## Spec-Driven Development App – Multi-Project Setup
Overview A web application (served by Python backend) that lets you create, review, and refine specifications using a spec-driven development workflow. The app supports multiple projects—you point it to different directories and switch between them.
Architecture

Python backend serves the web app locally
Frontend (Angular, bundled) provides the UI
Each project is a separate repository with a /specs folder containing markdown files
One spec app instance manages multiple projects

## Core Features
### Project Management

Add projects by pointing to local directories on your filesystem
Switch between projects seamlessly
Each project's specs are isolated

### Spec Editing & Review

WYSIWYG markdown editor with inline editing
Mark sections with to-dos or requirements
Left sidebar shows uncommitted files (files not yet committed to git)
Filter files by status (has to-dos, changed, etc.)
Save changes directly back to markdown files

### Format Support

Markdown: syntax highlighting, inline editing
Hex colors: highlighted in the editor
Tables: rendered nicely in preview
VTT: display recordings with player
JSON: downloadable artifacts
HTML: downloadable artifacts
Mermaid: diagrams rendered inline
Extensible format registry for future additions

### Workflow Documentation

Built-in guide explaining the intake-to-delivery pipeline
Guided tour for new users (tooltips, highlighted sections)
Example specs showing best practices
Help section accessible throughout the app

### Spec-Driven Pipeline

Intake: raw brainstorming/requirements (markdown files)
Discovery: refine and structure specs
Delivery: finalized, approved specs
Clear visual separation of stages in the UI

### Setup for Colleagues

Clone spec-app repo
Run Python backend (python app.py or similar)
Open app in browser (localhost)
Add project by pointing to their local dashboard repo
Start reviewing and refining specs

### Tech Stack

Backend: Python (Flask or similar)
Frontend: Angular (single HTML bundle or dev server)
Storage: Local filesystem (specs as markdown files in git repos)

### Weekend Scope

Restructure codebase: separate spec-app into its own repo
Implement project switcher (add/select projects)
Document the workflow within the app (basic guide + examples)
Test with your dashboard project as the first test case