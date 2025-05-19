# SurveyKong Frontend Context

## Project Overview

The SurveyKong frontend is a modern, responsive web application built with React and TypeScript. It provides an interactive UI for orchestrating the end-to-end survey research workflow, integrating with the SurveyKong backend (FastAPI) to automate survey design, cohort selection, distribution, and analysis.

## Core Architecture

- **Framework:** React (with Vite for dev/build tooling)
- **Language:** TypeScript
- **State Management:** React hooks and local component state (no external state library)
- **Styling:** Inline styles for rapid prototyping; ready for migration to CSS-in-JS or a component library if needed
- **Responsiveness:** Custom hook (`useResponsive`) for mobile/desktop adaptation; layout adjusts for different screen sizes

## Main UI Structure

- **App Bar:** Persistent header with app branding
- **Main Content Area:** Displays the UI for the current workflow step (form, survey preview, etc.)
- **Workflow Pane:** Right-hand (or bottom, on mobile) navigation showing all workflow steps; interactive and highlights the current step

## Workflow Steps (Mirrors Backend Pipeline)

1. **Framing:** User enters a research question; generates a survey spec
2. **Survey Design:** User reviews/refines generated survey questions
3. **Cohort Selection:** User defines or reviews the target audience
4. **Distribution:** User initiates survey distribution and monitors collection
5. **Analysis:** User views results and insights

## Component Conventions

- **Functional Components:** All UI is built with functional React components
- **Props & Types:** Use TypeScript interfaces for all props and data models
- **Responsiveness:** Use relative units, max-widths, and the `useResponsive` hook for layout adaptation
- **Workflow Navigation:** Controlled by a `currentStep` state; navigation is interactive and stateful

## Extensibility & Best Practices

- **Add New Features:** Place new UI logic in modular components; keep business logic separate from presentation
- **Integrate Backend:** Use `fetch` or a future API abstraction for backend calls; handle loading and error states
- **Styling:** For new features, prefer inline styles or migrate to a CSS-in-JS solution for consistency
- **Accessibility:** Use semantic HTML and ARIA attributes for navigation and forms
- **Testing:** Add unit tests for new components if possible (Jest/React Testing Library recommended)
- **Documentation:** Update this context file and add code comments for any non-obvious logic

## Contribution Guidance

- **Follow the workflow model:** UI should reflect and guide the user through the backend pipeline steps
- **Keep UI responsive:** Test on both desktop and mobile
- **Prioritize clarity:** Favor readable, maintainable code and clear user flows
- **Iterate incrementally:** Ship small, testable features; avoid large, unreviewed changes

---

For any questions about backend integration or workflow logic, refer to the backend/context.md or ask a maintainer.
