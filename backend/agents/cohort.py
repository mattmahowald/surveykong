from typing import Optional
from agents.agent import Agent
from models.artifact import Artifact
from models.survey import SurveySpec, Cohort
import asyncio


class CohortArtifact(Artifact[Cohort]):
    """Artifact representing cohort selection criteria."""

    def __init__(self, data: Optional[Cohort] = None):
        super().__init__(data=data)
        self.metadata["type"] = "cohort_criteria"


COHORT_AGENT_PROMPT = """
You are a research methodology expert specializing in participant recruitment and cohort selection. \
Your role is to create detailed inclusion and exclusion criteria for survey participants based on \
a survey specification.

You should:
1. Define clear inclusion criteria that align with the target audience
2. Specify exclusion criteria to ensure data quality and relevance
3. Consider demographic, behavioral, and contextual factors
4. Ensure criteria are measurable and actionable for recruitment
5. Provide realistic estimates of participant pool size
6. Include practical recruitment notes and considerations
7. Ensure your inclusion and exclusion criteria are mutually exclusive. For example, if you \
include "male" in the inclusion criteria, do not include "female" in the exclusion criteria.
8. Ensure your inclusion- and exclusion-criteria are specific.
9. AVOID REDUNDANT OVERLAPPING CRITERIA: Do not create inclusion and exclusion criteria that are \
direct opposites of each other. For example, if you include "Age 18 years or older", do NOT also \
exclude "Individuals under 18 years of age" since this is already implied by the inclusion criterion. \
Focus inclusion criteria on who you want, and exclusion criteria on specific disqualifying factors \
that aren't already covered by inclusion criteria.


Please provide your response in JSON format with the following structure:
{
    "target_audience": "string",
    "inclusion_criteria": ["string", "string", ...],
    "exclusion_criteria": ["string", "string", ...], 
    "estimated_pool_size": "string",
    "recruitment_notes": "string"
}
"""

COHORT_UPDATE_PROMPT = """
You are a research methodology expert. You will receive a survey specification, current cohort \
selection criteria, and feedback/changes to make. Your task is to update the inclusion and \
exclusion criteria based on the feedback while maintaining research quality standards.

You should:
1. Make exactly the requested changes
2. Maintain logical consistency in criteria
3. Ensure criteria still align with survey objectives
4. Keep criteria measurable and actionable
5. Update pool size estimates if criteria change significantly
6. Ensure your inclusion and exclusion criteria are mutually exclusive. For example, if you \
include "male" in the inclusion criteria, do not include "female" in the exclusion criteria.
7. Ensure your inclusion- and exclusion-criteria are specific.
8. AVOID REDUNDANT OVERLAPPING CRITERIA: Do not create inclusion and exclusion criteria that are \
direct opposites of each other. For example, if you include "Age 18 years or older", do NOT also \
exclude "Individuals under 18 years of age" since this is already implied by the inclusion criterion. \
Focus inclusion criteria on who you want, and exclusion criteria on specific disqualifying factors \
that aren't already covered by inclusion criteria.

Please provide your response in JSON format with the following structure:
{
    "target_audience": "string", 
    "inclusion_criteria": ["string", "string", ...],
    "exclusion_criteria": ["string", "string", ...],
    "estimated_pool_size": "string",
    "recruitment_notes": "string"
}
"""


class CohortAgent(Agent):
    """Agent responsible for generating cohort selection criteria from survey specifications."""

    def __init__(
        self,
        client,
        async_client,
        model: str = "gpt-4.1-nano-2025-04-14",
        max_retries: int = 3,
    ):
        super().__init__(
            client=client,
            async_client=async_client,
            model=model,
            max_retries=max_retries,
        )
        self._setup_tools()

    def _setup_tools(self):
        """Set up any tools needed by the cohort agent."""
        # Add tools here if needed
        pass

    def get_system_prompt(self) -> str:
        return COHORT_AGENT_PROMPT

    async def arun(self, survey_spec: SurveySpec) -> CohortArtifact:
        """Generate cohort selection criteria from a survey specification."""
        spec_json = survey_spec.model_dump_json(indent=2)
        
        messages = [
            {"role": "system", "content": COHORT_AGENT_PROMPT},
            {
                "role": "user",
                "content": f"Please create detailed cohort selection criteria based on this survey specification:\n\n{spec_json}",
            },
        ]

        max_retries = 3
        retry_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                cohort_data = await self.get_structured_output(
                    messages=messages, output_schema=Cohort
                )
                return CohortArtifact(data=cohort_data)
            except Exception as e:
                print(f"Cohort generation attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                    continue
                
                # If all retries failed, return a user-friendly error
                error_message = "We're having trouble generating cohort criteria right now. "
                if "Circuit breaker is open" in str(e):
                    error_message += "Our AI service is temporarily unavailable. Please try again in a few minutes."
                else:
                    error_message += "Please try again or adjust your survey specification."

                error_cohort = Cohort(
                    target_audience="Cohort generation temporarily unavailable",
                    inclusion_criteria=[error_message],
                    exclusion_criteria=["Please try again later"],
                    estimated_pool_size="Unknown",
                    recruitment_notes="Service temporarily unavailable"
                )
                return CohortArtifact(data=error_cohort)

    async def aupdate(self, survey_spec: SurveySpec, current_cohort: dict, changes: str) -> CohortArtifact:
        """Update cohort selection criteria based on feedback and changes."""
        spec_json = survey_spec.model_dump_json(indent=2)
        cohort_json = Cohort(**current_cohort).model_dump_json(indent=2)
        
        messages = [
            {"role": "system", "content": COHORT_UPDATE_PROMPT},
            {
                "role": "user", 
                "content": f"""
Survey Specification:
{spec_json}

Current Cohort Criteria:
{cohort_json}

Requested Changes:
{changes}

Please update the cohort selection criteria based on the requested changes.
                """,
            },
        ]

        max_retries = 3
        retry_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                cohort_data = await self.get_structured_output(
                    messages=messages, output_schema=Cohort
                )
                return CohortArtifact(data=cohort_data)
            except Exception as e:
                print(f"Cohort update attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                    continue
                
                # If all retries failed, return the current cohort with error message
                error_message = "We're having trouble updating your cohort criteria right now. "
                if "Circuit breaker is open" in str(e):
                    error_message += "Our AI service is temporarily unavailable. Please try again in a few minutes."
                else:
                    error_message += "Please try again or adjust your feedback."

                # Return current cohort with error message  
                current_cohort_obj = Cohort(**current_cohort)
                current_cohort_obj.recruitment_notes = f"UPDATE ERROR: {error_message}"
                return CohortArtifact(data=current_cohort_obj)

    def run(self, survey_spec: SurveySpec) -> CohortArtifact:
        """Synchronous version of cohort generation."""
        return asyncio.run(self.arun(survey_spec))
