import asyncio
import logging
from typing import Optional, Dict, Any
from uuid import UUID

from agents.spec import Spec, SpecAgent

# Commented out until agents are fully implemented
# from agents.survey import Survey, SurveyAgent
# from agents.cohort import Cohort, CohortAgent
# from agents.outbound import OutboundResults, OutboundAgent
# from agents.analysis import AnalysisReport, AnalysisAgent
from models.artifact import Artifact
from controllers.db import (
    DB,
    db_context,
    DBError,
)

logger = logging.getLogger(__name__)


class SurveyOrchestrator:
    """Orchestrates the survey workflow with clean database integration."""

    def __init__(
        self,
        client=None,
        async_client=None,
        db_service: Optional[DB] = None,
    ):
        """Initialize orchestrator with OpenAI clients and optional database service."""
        self.db = db_service or DB()

        # Set up OpenAI clients (these would come from your existing setup)
        self.client = client
        self.async_client = async_client

        # Initialize agents with OpenAI clients
        if client and async_client:
            self.spec_agent = SpecAgent(client=client, async_client=async_client)
            # Uncomment as other agents are implemented
            # self.survey_agent = SurveyAgent(client=client, async_client=async_client)
            # self.cohort_agent = CohortAgent(client=client, async_client=async_client)
            # self.outbound_agent = OutboundAgent(client=client, async_client=async_client)
            # self.analysis_agent = AnalysisAgent(client=client, async_client=async_client)
        else:
            self.spec_agent = None

    async def create_project(self, name: str, description: str) -> UUID:
        """Create a new survey project."""
        try:
            project_data = {
                "name": name,
                "description": description,
                "status": "created",
                "workflow_stage": "spec",
            }

            project = await self.db.create_project(project_data)
            logger.info(f"Created project {project['id']}")
            return UUID(project["id"])

        except DBError as e:
            logger.error(f"Failed to create project: {e}")
            raise

    async def run_research_spec(
        self, project_id: UUID, research_question: str
    ) -> Artifact[Spec]:
        """Generate research specification and save to database."""
        try:
            # Run the spec agent
            spec_artifact = await self.spec_agent.arun(research_question)

            # Save the spec to database
            await self.db.create_survey_spec(
                project_id=project_id, data=spec_artifact.model_dump()
            )

            # Update project status
            await self.db.update_project(
                project_id,
                {"workflow_stage": "survey", "last_updated": "spec_completed"},
            )

            logger.info(f"Completed research spec for project {project_id}")
            return spec_artifact

        except Exception as e:
            logger.error(f"Failed to generate research spec: {e}")
            await self._update_project_error(project_id, "spec_failed", str(e))
            raise

    async def run_survey_creation(
        self, project_id: UUID, spec_artifact: Artifact[Spec]
    ) -> Artifact:  # Changed from Artifact[Survey] since Survey isn't imported
        """Generate survey from specification."""
        try:
            # For now, create a placeholder since SurveyAgent isn't fully implemented
            # survey_artifact = await self.survey_agent.arun(spec_artifact.data)

            # Placeholder implementation
            # from agents.survey import Survey
            # placeholder_survey = Survey(data=None)
            survey_artifact = Artifact(data={"placeholder": "survey_data"})

            # Save survey to database (you'd extend the schema for this)
            await self.db.save_artifact(
                table_name="surveys",
                artifact=survey_artifact,
                project_id=str(project_id),
            )

            # Update project status
            await self.db.update_project(
                project_id,
                {"workflow_stage": "cohort", "last_updated": "survey_completed"},
            )

            logger.info(f"Completed survey creation for project {project_id}")
            return survey_artifact

        except Exception as e:
            logger.error(f"Failed to create survey: {e}")
            await self._update_project_error(project_id, "survey_failed", str(e))
            raise

    async def run_cohort_selection(
        self, project_id: UUID, survey_artifact: Artifact
    ) -> Artifact:  # Removed type hints for unimplemented classes
        """Generate target cohort for survey."""
        try:
            # cohort_artifact = await self.cohort_agent.arun(survey_artifact.data)
            cohort_artifact = Artifact(data={"placeholder": "cohort_data"})

            await self.db.save_artifact(
                table_name="cohorts",
                artifact=cohort_artifact,
                project_id=str(project_id),
            )

            await self.db.update_project(
                project_id,
                {"workflow_stage": "outbound", "last_updated": "cohort_completed"},
            )

            logger.info(f"Completed cohort selection for project {project_id}")
            return cohort_artifact

        except Exception as e:
            logger.error(f"Failed to select cohort: {e}")
            await self._update_project_error(project_id, "cohort_failed", str(e))
            raise

    async def run_outbound_distribution(
        self,
        project_id: UUID,
        survey_artifact: Artifact,
        cohort_artifact: Artifact,
    ) -> Artifact:  # Removed type hints for unimplemented classes
        """Distribute survey and collect responses."""
        try:
            # outbound_artifact = await self.outbound_agent.arun(
            #     survey_artifact.data, cohort_artifact.data
            # )
            outbound_artifact = Artifact(data={"placeholder": "outbound_data"})

            await self.db.save_artifact(
                table_name="outbound_results",
                artifact=outbound_artifact,
                project_id=str(project_id),
            )

            await self.db.update_project(
                project_id,
                {"workflow_stage": "analysis", "last_updated": "outbound_completed"},
            )

            logger.info(f"Completed outbound distribution for project {project_id}")
            return outbound_artifact

        except Exception as e:
            logger.error(f"Failed to distribute survey: {e}")
            await self._update_project_error(project_id, "outbound_failed", str(e))
            raise

    async def run_analysis(
        self, project_id: UUID, outbound_artifact: Artifact
    ) -> Artifact:  # Removed type hints for unimplemented classes
        """Analyze survey results and generate report."""
        try:
            # analysis_artifact = await self.analysis_agent.arun(outbound_artifact.data)
            analysis_artifact = Artifact(data={"placeholder": "analysis_data"})

            await self.db.save_artifact(
                table_name="analysis_reports",
                artifact=analysis_artifact,
                project_id=str(project_id),
            )

            await self.db.update_project(
                project_id,
                {"workflow_stage": "completed", "last_updated": "analysis_completed"},
            )

            logger.info(f"Completed analysis for project {project_id}")
            return analysis_artifact

        except Exception as e:
            logger.error(f"Failed to analyze results: {e}")
            await self._update_project_error(project_id, "analysis_failed", str(e))
            raise

    async def orchestrate_full_workflow(
        self,
        research_question: str,
        project_name: str = "Survey Project",
        project_description: str = "",
    ) -> Artifact:  # Removed type hints for unimplemented classes
        """Run the complete survey workflow from question to analysis."""
        project_id = None

        try:
            # Create project
            project_id = await self.create_project(project_name, project_description)

            # Run workflow stages
            spec = await self.run_research_spec(project_id, research_question)
            survey = await self.run_survey_creation(project_id, spec)
            cohort = await self.run_cohort_selection(project_id, survey)
            outbound = await self.run_outbound_distribution(project_id, survey, cohort)
            analysis = await self.run_analysis(project_id, outbound)

            logger.info(
                f"Successfully completed full workflow for project {project_id}"
            )
            return analysis

        except Exception as e:
            if project_id:
                await self._update_project_error(
                    project_id, "workflow_failed", f"Full workflow failed: {e}"
                )
            logger.error(f"Full workflow failed: {e}")
            raise

    async def get_project_status(self, project_id: UUID) -> Dict[str, Any]:
        """Get current status of a project."""
        try:
            project = await self.db.get_project(project_id)
            if not project:
                raise ValueError(f"Project {project_id} not found")

            return {
                "id": project["id"],
                "created_at": project["created_at"],
                "status": project["data"].get("status", "unknown"),
                "workflow_stage": project["data"].get("workflow_stage", "unknown"),
                "last_updated": project["data"].get("last_updated"),
                "error": project["data"].get("error"),
            }

        except DBError as e:
            logger.error(f"Failed to get project status: {e}")
            raise

    async def _update_project_error(
        self, project_id: UUID, status: str, error_message: str
    ):
        """Update project with error status."""
        try:
            await self.db.update_project(
                project_id,
                {"status": status, "error": error_message, "last_updated": status},
            )
        except Exception as e:
            logger.error(f"Failed to update project error status: {e}")

    async def health_check(self) -> bool:
        """Check if orchestrator and database are healthy."""
        return await self.db.health_check()


# =============== USAGE EXAMPLES ===============


async def example_usage():
    """Example of how to use the improved orchestrator."""

    # Using context manager for automatic cleanup
    async with db_context() as db:
        # You'll need to set up OpenAI clients
        # from openai import OpenAI, AsyncOpenAI
        # client = OpenAI()
        # async_client = AsyncOpenAI()

        orchestrator = SurveyOrchestrator(client=None, async_client=None, db_service=db)

        try:
            # Check health first
            if not await orchestrator.health_check():
                raise RuntimeError("Database is not healthy")

            # For now, just test project creation and spec generation
            project_id = await orchestrator.create_project(
                "Test Project", "A test project for the new orchestrator"
            )

            print(f"Created project: {project_id}")

            # Check if we have agents available
            if orchestrator.spec_agent:
                spec = await orchestrator.run_research_spec(
                    project_id, "What factors influence remote work productivity?"
                )
                print(f"Generated spec: {spec.data}")
            else:
                print("No OpenAI clients provided - skipping spec generation")

        except DBError as e:
            print(f"Database error: {e}")
        except Exception as e:
            print(f"Workflow error: {e}")


async def example_step_by_step():
    """Example of running workflow step by step with status checking."""

    orchestrator = SurveyOrchestrator()

    try:
        # Create project
        project_id = await orchestrator.create_project(
            "Step by Step Survey", "Example of manual workflow control"
        )

        # Run each step individually
        spec = await orchestrator.run_research_spec(
            project_id, "How do people prefer to receive feedback?"
        )

        # Check status after each step
        status = await orchestrator.get_project_status(project_id)
        print(f"Status after spec: {status}")

        survey = await orchestrator.run_survey_creation(project_id, spec)

        status = await orchestrator.get_project_status(project_id)
        print(f"Status after survey: {status}")

        # Continue with remaining steps...

    except Exception as e:
        print(f"Step-by-step workflow failed: {e}")


if __name__ == "__main__":
    # Run example
    asyncio.run(example_usage())
