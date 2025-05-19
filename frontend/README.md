# SurveyKong Frontend

A modern, responsive web app for orchestrating the end-to-end survey research workflow, built with React and TypeScript. The frontend guides users through survey design, cohort selection, distribution, and analysis, integrating with the SurveyKong backend (FastAPI).

## Features

- Interactive, step-based workflow UI
- Research question input and survey spec generation
- Responsive design for desktop and mobile
- Modular, extensible React components
- Integration with backend API for survey automation

## Workflow Steps

1. **Framing:** Enter a research question to generate a survey spec
2. **Survey Design:** Review and refine generated survey questions
3. **Cohort Selection:** Define or review the target audience
4. **Distribution:** Distribute the survey and collect responses
5. **Analysis:** Analyze results and view insights

## Quickstart

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.
4. Ensure the backend API is running at [http://localhost:8000](http://localhost:8000).

## Development Guidance

- All UI is built with functional React components and TypeScript
- State is managed with React hooks
- Styling uses inline styles for rapid prototyping
- See `context.md` for architecture, conventions, and contribution guidelines

## Documentation

- [context.md](./context.md) — Developer context and best practices

---

For backend details, see `../backend/context.md`.
