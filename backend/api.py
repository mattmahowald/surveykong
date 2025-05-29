from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from models.survey import SurveySpec, Cohort
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


@app.post("/api/survey/questions")
async def generate_survey_questions(request: Request):
    data = await request.json()
    # Expect the full SurveySpec as input
    survey_spec = SurveySpec(**data)
    survey = await orchestrator.survey_agent.arun(survey_spec)
    return survey.data.model_dump()


@app.post("/api/survey/questions/update")
async def update_survey_questions(request: Request):
    data = await request.json()
    survey_spec = data.get("survey_spec")
    survey = data.get("survey")
    changes = data.get("changes")
    
    # Convert to model objects
    survey_spec_model = SurveySpec(**survey_spec)
    
    # Use survey agent to update questions based on changes
    updated_survey = await orchestrator.survey_agent.aupdate(survey_spec_model, survey, changes)
    return updated_survey.data.model_dump()


@app.post("/api/cohort/criteria")
async def generate_cohort_criteria(request: Request):
    data = await request.json()
    # Expect the full SurveySpec as input
    survey_spec = SurveySpec(**data)
    cohort = await orchestrator.cohort_agent.arun(survey_spec)
    return cohort.data.model_dump()


@app.post("/api/cohort/criteria/update")
async def update_cohort_criteria(request: Request):
    data = await request.json()
    survey_spec = data.get("survey_spec")
    cohort = data.get("cohort")
    changes = data.get("changes")
    
    # Convert to model objects
    survey_spec_model = SurveySpec(**survey_spec)
    
    # Use cohort agent to update criteria based on changes
    updated_cohort = await orchestrator.cohort_agent.aupdate(survey_spec_model, cohort, changes)
    return updated_cohort.data.model_dump()
