import os
import asyncio
from typing import Any, Dict, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError(
        "SUPABASE_URL and SUPABASE_KEY must be set in your .env file."
    )

# Singleton client
_client: Optional[Client] = None


def get_client() -> Client:
    """Get or create Supabase client singleton."""
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


# ------------------- PROJECTS CRUD -------------------


async def create_project(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new project with the given data (dict for JSONB)."""
    client = get_client()
    # Note: With the new SDK, we use synchronous methods by default
    # If you need async, you can use the postgrest-py directly or wrap in asyncio
    result = client.table("projects").insert({"data": data}).execute()
    if not result.data:
        raise RuntimeError(f"Failed to create project: {result}")
    return result.data[0]


async def get_project(project_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a project by its ID."""
    client = get_client()
    result = client.table("projects").select("*").eq("id", project_id).execute()
    if not result.data:
        return None
    return result.data[0]


async def update_project(project_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update a project's data by its ID (replaces the JSONB data)."""
    client = get_client()
    result = (
        client.table("projects")
        .update({"data": data})
        .eq("id", project_id)
        .execute()
    )
    if not result.data:
        raise RuntimeError(f"Failed to update project {project_id}: {result}")
    return result.data[0]


async def delete_project(project_id: str) -> bool:
    """Delete a project by its ID. Returns True if deleted."""
    client = get_client()
    result = client.table("projects").delete().eq("id", project_id).execute()
    return bool(result.data)


async def list_projects() -> List[Dict[str, Any]]:
    """List all projects."""
    client = get_client()
    result = client.table("projects").select("*").execute()
    return result.data or []


# ------------------- SURVEY SPECS CRUD -------------------


async def create_survey_spec(project_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new survey spec linked to a project."""
    client = get_client()
    result = (
        client.table("survey_specs")
        .insert({"project_id": project_id, "data": data})
        .execute()
    )
    if not result.data:
        raise RuntimeError(f"Failed to create survey spec: {result}")
    return result.data[0]


async def get_survey_spec(spec_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a survey spec by its ID."""
    client = get_client()
    result = client.table("survey_specs").select("*").eq("id", spec_id).execute()
    if not result.data:
        return None
    return result.data[0]


async def update_survey_spec(spec_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update a survey spec's data by its ID (replaces the JSONB data)."""
    client = get_client()
    result = (
        client.table("survey_specs")
        .update({"data": data})
        .eq("id", spec_id)
        .execute()
    )
    if not result.data:
        raise RuntimeError(f"Failed to update survey spec {spec_id}: {result}")
    return result.data[0]


async def delete_survey_spec(spec_id: str) -> bool:
    """Delete a survey spec by its ID. Returns True if deleted."""
    client = get_client()
    result = client.table("survey_specs").delete().eq("id", spec_id).execute()
    return bool(result.data)


async def list_survey_specs_by_project(project_id: str) -> List[Dict[str, Any]]:
    """List all survey specs for a given project."""
    client = get_client()
    result = (
        client.table("survey_specs")
        .select("*")
        .eq("project_id", project_id)
        .execute()
    )
    return result.data or []


# Alternative: If you need true async operations, you can create async wrapper functions
# or use asyncio.to_thread() for CPU-bound operations
async def create_project_async(data: Dict[str, Any]) -> Dict[str, Any]:
    """Async version using asyncio.to_thread for thread safety."""
    def _create():
        client = get_client()
        return client.table("projects").insert({"data": data}).execute()
    
    result = await asyncio.to_thread(_create)
    if not result.data:
        raise RuntimeError(f"Failed to create project: {result}")
    return result.data[0]
