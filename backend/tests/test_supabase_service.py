import pytest
import asyncio
import uuid
from typing import Dict, Any
import sys
import os

# Add parent directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import supabase_service as svc

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]

# --------- Helper functions ---------


def random_project_data() -> Dict[str, Any]:
    return {
        "title": f"Test Project {uuid.uuid4()}",
        "description": "pytest project",
        "status": "draft",
    }


def random_spec_data() -> Dict[str, Any]:
    return {"questions": ["Q1", "Q2"], "target_audience": "pytesters", "version": 1}


# --------- Project CRUD Tests ---------


async def test_create_get_update_delete_project():
    # Create
    pdata = random_project_data()
    project = await svc.create_project(pdata)
    assert project["data"] == pdata
    pid = project["id"]

    # Get
    fetched = await svc.get_project(pid)
    assert fetched is not None
    assert fetched["id"] == pid
    assert fetched["data"] == pdata

    # Update
    new_data = {**pdata, "status": "completed"}
    updated = await svc.update_project(pid, new_data)
    assert updated["data"]["status"] == "completed"

    # List
    projects = await svc.list_projects()
    assert any(p["id"] == pid for p in projects)

    # Delete
    deleted = await svc.delete_project(pid)
    assert deleted
    assert await svc.get_project(pid) is None


async def test_get_project_invalid_id():
    assert await svc.get_project(str(uuid.uuid4())) is None


# --------- Survey Spec CRUD Tests ---------


async def test_create_get_update_delete_survey_spec():
    # Create a project to link
    pdata = random_project_data()
    project = await svc.create_project(pdata)
    pid = project["id"]

    # Create
    sdata = random_spec_data()
    spec = await svc.create_survey_spec(pid, sdata)
    assert spec["data"] == sdata
    sid = spec["id"]

    # Get
    fetched = await svc.get_survey_spec(sid)
    assert fetched is not None
    assert fetched["id"] == sid
    assert fetched["data"] == sdata

    # Update
    new_sdata = {**sdata, "version": 2}
    updated = await svc.update_survey_spec(sid, new_sdata)
    assert updated["data"]["version"] == 2

    # List by project
    specs = await svc.list_survey_specs_by_project(pid)
    assert any(s["id"] == sid for s in specs)

    # Delete
    deleted = await svc.delete_survey_spec(sid)
    assert deleted
    assert await svc.get_survey_spec(sid) is None

    # Cleanup project
    await svc.delete_project(pid)


async def test_get_survey_spec_invalid_id():
    assert await svc.get_survey_spec(str(uuid.uuid4())) is None


async def test_list_survey_specs_by_project_empty():
    # Create a project
    pdata = random_project_data()
    project = await svc.create_project(pdata)
    pid = project["id"]
    specs = await svc.list_survey_specs_by_project(pid)
    assert specs == []
    await svc.delete_project(pid)


async def test_cascade_delete_project_deletes_specs():
    # Create project
    pdata = random_project_data()
    project = await svc.create_project(pdata)
    pid = project["id"]
    # Create two specs
    s1 = await svc.create_survey_spec(pid, random_spec_data())
    s2 = await svc.create_survey_spec(pid, random_spec_data())
    # Delete project
    await svc.delete_project(pid)
    # Both specs should be gone
    assert await svc.get_survey_spec(s1["id"]) is None
    assert await svc.get_survey_spec(s2["id"]) is None
