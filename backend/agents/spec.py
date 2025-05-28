from typing import Dict, Any, Optional, List
from agents.agent import Agent
from pydantic import BaseModel, Field
import json
import asyncio
from models.artifact import Artifact
from models.survey import Question, SurveySpec


class Spec(Artifact[SurveySpec]):
    """Artifact representing a survey specification.\n    \n    This class is now fully compatible with the DB layer via db.create_survey_spec.\n"""

    def __init__(self, data: Optional[SurveySpec] = None):
        super().__init__(data=data)
        self.metadata["type"] = "survey_specification"


SPEC_AGENT_PROMPT = """
You are a survey specification expert. Your role is to analyze survey requests \
and create detailed specifications that will guide the survey creation process. \
You should consider:
    1. The purpose and goals of the survey
    2. Target audience and their characteristics
    3. The essential hypotheses that the survey will need to test to meet the survey's goals
    4. Target completion time for respondents
    5. Target number of responses needed

Provide clear, actionable specifications that can be used to create an effective survey.

Please provide your response in JSON format with the following structure:
{
    "title": "string",
    "description": "string",
    "questions": [
        {
            "text": "string",
            "type": "multiple_choice|text|rating|boolean",
            "options": ["string"] (optional),
            "required": boolean
        }
    ],
    "target_audience": "string",
    "targeted_completion_time": "string",
    "targeted_number_of_responses": integer,
    "hypothesis_tested": ["string", "string", ...] // List of hypotheses being tested
}
"""


class SpecAgent(Agent):
    """Agent responsible for generating survey specifications."""

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
        """Set up any tools needed by the spec agent."""
        # Add tools here if needed
        pass

    def get_system_prompt(self) -> str:
        return SPEC_AGENT_PROMPT

    async def arun(self, survey_request: str) -> Spec:
        """Asynchronous version of run."""
        messages = [
            {"role": "system", "content": SPEC_AGENT_PROMPT},
            {
                "role": "user",
                "content": f"Please create a survey specification in JSON format for the following request:\n\n{survey_request}",
            },
        ]

        max_retries = 3
        retry_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                spec_data = await self.get_structured_output(
                    messages=messages, output_schema=SurveySpec
                )
                return Spec(data=spec_data)
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                    continue
                
                # If all retries failed, return a user-friendly error
                error_message = "We're having trouble generating your survey specification right now. "
                if "Circuit breaker is open" in str(e):
                    error_message += "Our AI service is temporarily unavailable. Please try again in a few minutes."
                else:
                    error_message += "Please try again or rephrase your request."

                error_spec = SurveySpec(
                    title="Survey Generation Temporarily Unavailable",
                    description=error_message,
                    questions=[],
                    target_audience="Not available - please try again",
                    targeted_completion_time="Not available - please try again",
                    targeted_number_of_responses=0,
                    hypothesis_tested=["Not available - please try again"]
                )
                return Spec(data=error_spec)

    def run(self, survey_request: str) -> Spec:
        """Generate a survey specification based on the request."""
        return asyncio.run(self.arun(survey_request))
