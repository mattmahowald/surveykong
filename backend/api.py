from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from controllers.orchestrate import SurveyOrchestrator
from controllers.db import db_context, DBError
from openai import OpenAI, AsyncOpenAI
import os
from uuid import UUID

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


# ========== PROJECTS CRUD ==========


@app.post("/api/projects")
async def create_project(data: dict):
    async with db_context() as db:
        try:
            project = await db.create_project(data)
            return project
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects")
async def list_projects(limit: int = 50, offset: int = 0):
    async with db_context() as db:
        try:
            return await db.list_projects(limit=limit, offset=offset)
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    async with db_context() as db:
        try:
            project = await db.get_project(project_id)
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            return project
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, data: dict):
    async with db_context() as db:
        try:
            updated = await db.update_project(project_id, data)
            return updated
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    async with db_context() as db:
        try:
            deleted = await db.delete_project(project_id)
            if not deleted:
                raise HTTPException(
                    status_code=404, detail="Project not found or already deleted"
                )
            return {"success": True}
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


# ========== SURVEY SPECS CRUD ==========


@app.post("/api/survey_specs")
async def create_survey_spec(data: dict):
    async with db_context() as db:
        try:
            project_id = data.get("project_id")
            spec_data = data.get("data")
            if not project_id or not spec_data:
                raise HTTPException(
                    status_code=400, detail="project_id and data are required"
                )
            spec = await db.create_survey_spec(project_id, spec_data)
            return spec
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/survey_specs/{spec_id}")
async def get_survey_spec(spec_id: str):
    async with db_context() as db:
        try:
            spec = await db.get_survey_spec(spec_id)
            if not spec:
                raise HTTPException(status_code=404, detail="Survey spec not found")
            return spec
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/survey_specs")
async def list_survey_specs_by_project(
    project_id: str, limit: int = 50, offset: int = 0
):
    async with db_context() as db:
        try:
            return await db.list_survey_specs_by_project(
                project_id, limit=limit, offset=offset
            )
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


# Optionally, add update/delete for survey_specs if needed
# (Assuming update is just replacing the data field)
@app.put("/api/survey_specs/{spec_id}")
async def update_survey_spec(spec_id: str, data: dict):
    async with db_context() as db:
        try:
            # Only update the data field
            updated = await db.save_artifact("survey_specs", data, id=spec_id)
            return updated
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/survey_specs/{spec_id}")
async def delete_survey_spec(spec_id: str):
    async with db_context() as db:
        try:
            # There is no explicit delete_survey_spec, so use the generic delete
            result = (
                await db.client.table("survey_specs")
                .delete()
                .eq("id", str(spec_id))
                .execute()
            )
            if not result.data:
                raise HTTPException(
                    status_code=404, detail="Survey spec not found or already deleted"
                )
            return {"success": True}
        except DBError as e:
            raise HTTPException(status_code=500, detail=str(e))
