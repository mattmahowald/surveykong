from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from models.survey import SurveySpec
from orchestrate import SurveyOrchestrator
from openai import OpenAI, AsyncOpenAI
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
orchestrator = SurveyOrchestrator(client=client, async_client=async_client)


@app.post("/api/survey")
async def create_survey(request: Request):
    data = await request.json()
    question = data.get("question")
    spec = await orchestrator.spec_agent.arun(question)
    return spec.data.model_dump()


@app.post("/api/survey/update")
async def update_survey(request: Request):
    data = await request.json()
    survey_spec = data.get("survey_spec")
    changes = data.get("changes")
    survey_spec_model = SurveySpec(**survey_spec)
    updated_spec = await orchestrator.spec_agent.aupdate(survey_spec_model, changes)
    return updated_spec.data.model_dump()
