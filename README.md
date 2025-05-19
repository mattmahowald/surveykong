# SurveyKong

SurveyKong is an agentic platform for automating the entire survey research process—from research question to data analysis—using LLMs and modular agents. It consists of a Python backend (FastAPI, OpenAI) and a modern React/TypeScript frontend.

## Repo Structure

- `backend/` — Python backend (FastAPI API, agent orchestration, OpenAI integration)
- `frontend/` — React + TypeScript frontend (interactive workflow UI)

## Main Workflow

1. **Framing:** Turn a research question into a structured survey spec
2. **Survey Design:** Generate and review survey questions
3. **Cohort Selection:** Define/select the target audience
4. **Distribution:** Distribute the survey and collect responses
5. **Analysis:** Analyze results and generate insights

## Quickstart

### Backend

1. Install dependencies (in `backend/`):
   ```sh
   poetry install
   pip install fastapi uvicorn
   ```
2. Set up `.env` with your OpenAI API key.
3. Start the API server:
   ```sh
   uvicorn api:app --reload
   ```

### Frontend

1. Install dependencies (in `frontend/`):
   ```sh
   npm install
   ```
2. Start the dev server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Documentation

- [backend/context.md](./backend/context.md) — Backend architecture & agent design
- [frontend/context.md](./frontend/context.md) — Frontend architecture & workflow

---

For questions or contributions, see the context docs or contact a maintainer.
