from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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
