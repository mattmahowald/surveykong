"""
Updated db.py that works with the current codebase.
This is a simpler version that fixes the immediate issues.
"""

import os
import asyncio
import logging
from typing import Any, Dict, List, Optional, Union
from uuid import UUID
from datetime import datetime
from contextlib import asynccontextmanager

from supabase import create_client, Client
from postgrest.exceptions import APIError
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)


class DBError(Exception):
    """Base exception for DB operations."""

    def __init__(self, message: str, original_error: Optional[Exception] = None):
        super().__init__(message)
        self.original_error = original_error


class DBConnectionError(DBError):
    """Raised when connection to DB fails."""

    pass


class DB:
    """Clean, async DB service (Supabase)."""

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        """Initialize DB service with connection parameters."""
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_KEY")

        if not self.url or not self.key:
            raise DBConnectionError(
                "SUPABASE_URL and SUPABASE_KEY must be provided or set in environment"
            )

        self._client: Optional[Client] = None

    @property
    def client(self) -> Client:
        """Lazy-loaded Supabase client."""
        if self._client is None:
            try:
                self._client = create_client(self.url, self.key)
            except Exception as e:
                raise DBConnectionError(f"Failed to create Supabase client: {e}", e)
        return self._client

    async def _execute_query(self, query_func):
        """Execute a DB query with proper error handling."""
        try:
            # query_func should be a callable that returns the result
            result = await asyncio.to_thread(query_func)
            return result
        except APIError as e:
            logger.error(f"DB API error: {e}")
            raise DBError(f"Database operation failed: {e}", e)
        except Exception as e:
            logger.error(f"Unexpected error in database operation: {e}")
            raise DBError(f"Unexpected database error: {e}", e)

    # =============== PROJECT OPERATIONS ===============

    async def create_project(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new project with validated data."""
        try:

            def _create():
                result = self.client.table("projects").insert({"data": data}).execute()
                if not result.data:
                    raise DBError("Failed to create project: no data returned")
                return result.data[0]

            return await self._execute_query(_create)
        except Exception as e:
            logger.error(f"Failed to create project: {e}")
            raise

    async def get_project(
        self, project_id: Union[str, UUID]
    ) -> Optional[Dict[str, Any]]:
        """Retrieve a project by ID."""
        try:

            def _get():
                result = (
                    self.client.table("projects")
                    .select("*")
                    .eq("id", str(project_id))
                    .execute()
                )
                return result.data[0] if result.data else None

            return await self._execute_query(_get)
        except Exception as e:
            logger.error(f"Failed to get project: {e}")
            raise

    async def update_project(
        self, project_id: Union[str, UUID], data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a project's data."""
        try:

            def _update():
                result = (
                    self.client.table("projects")
                    .update({"data": data})
                    .eq("id", str(project_id))
                    .execute()
                )
                if not result.data:
                    raise DBError(
                        f"Project {project_id} not found or could not be updated"
                    )
                return result.data[0]

            return await self._execute_query(_update)
        except Exception as e:
            logger.error(f"Failed to update project: {e}")
            raise

    async def delete_project(self, project_id: Union[str, UUID]) -> bool:
        """Delete a project by ID."""
        try:

            def _delete():
                result = (
                    self.client.table("projects")
                    .delete()
                    .eq("id", str(project_id))
                    .execute()
                )
                return bool(result.data)

            return await self._execute_query(_delete)
        except Exception as e:
            logger.error(f"Failed to delete project: {e}")
            raise

    async def list_projects(
        self,
        limit: int = 50,
        offset: int = 0,
        order_by: str = "created_at",
        ascending: bool = False,
    ) -> List[Dict[str, Any]]:
        """List projects with pagination and ordering."""
        try:

            def _list():
                query = self.client.table("projects").select("*")

                if ascending:
                    query = query.order(order_by, desc=False)
                else:
                    query = query.order(order_by, desc=True)

                result = query.range(offset, offset + limit - 1).execute()
                return result.data or []

            return await self._execute_query(_list)
        except Exception as e:
            logger.error(f"Failed to list projects: {e}")
            raise

    # =============== SURVEY SPEC OPERATIONS ===============

    async def create_survey_spec(
        self, project_id: Union[str, UUID], data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new survey spec linked to a project."""
        try:

            def _create():
                result = (
                    self.client.table("survey_specs")
                    .insert({"project_id": str(project_id), "data": data})
                    .execute()
                )
                if not result.data:
                    raise DBError("Failed to create survey spec: no data returned")
                return result.data[0]

            return await self._execute_query(_create)
        except Exception as e:
            logger.error(f"Failed to create survey spec: {e}")
            raise

    async def get_survey_spec(
        self, spec_id: Union[str, UUID]
    ) -> Optional[Dict[str, Any]]:
        """Retrieve a survey spec by ID."""
        try:

            def _get():
                result = (
                    self.client.table("survey_specs")
                    .select("*")
                    .eq("id", str(spec_id))
                    .execute()
                )
                return result.data[0] if result.data else None

            return await self._execute_query(_get)
        except Exception as e:
            logger.error(f"Failed to get survey spec: {e}")
            raise

    async def list_survey_specs_by_project(
        self, project_id: Union[str, UUID], limit: int = 50, offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List all survey specs for a project with pagination."""
        try:

            def _list():
                result = (
                    self.client.table("survey_specs")
                    .select("*")
                    .eq("project_id", str(project_id))
                    .order("created_at", desc=True)
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                return result.data or []

            return await self._execute_query(_list)
        except Exception as e:
            logger.error(f"Failed to list survey specs: {e}")
            raise

    # =============== ARTIFACT OPERATIONS ===============

    async def save_artifact(
        self,
        table_name: str,
        artifact: Any,  # Can be any object with model_dump method
        **additional_fields,
    ) -> Dict[str, Any]:
        """Save an artifact to any table with proper serialization."""
        try:
            if hasattr(artifact, "model_dump"):
                artifact_data = artifact.model_dump()
            else:
                artifact_data = artifact

            save_data = {"data": artifact_data, **additional_fields}

            def _save():
                result = self.client.table(table_name).insert(save_data).execute()
                if not result.data:
                    raise DBError(f"Failed to save artifact to {table_name}")
                return result.data[0]

            return await self._execute_query(_save)
        except Exception as e:
            logger.error(f"Failed to save artifact: {e}")
            raise

    # =============== HEALTH CHECK ===============

    async def health_check(self) -> bool:
        """Check if the database connection is healthy."""
        try:

            def _check():
                result = self.client.table("projects").select("id").limit(1).execute()
                return True

            await self._execute_query(_check)
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False


# =============== CONVENIENCE FUNCTIONS ===============


@asynccontextmanager
async def db_context():
    """Context manager for database operations."""
    service = DB()
    try:
        yield service
    finally:
        # Any cleanup logic here
        pass


# For backwards compatibility
async def create_project(data: Dict[str, Any]) -> Dict[str, Any]:
    service = DB()
    return await service.create_project(data)


async def get_project(project_id: str) -> Optional[Dict[str, Any]]:
    service = DB()
    return await service.get_project(project_id)
