from typing import Dict, Any, Optional, List
from agents.agent import Agent, Artifact
from pydantic import BaseModel, Field
import json
import asyncio


class Question(BaseModel):
    """Model for a survey question."""

    text: str
    type: str = Field(..., pattern="^(multiple_choice|text|rating|boolean)$")
    options: Optional[List[str]] = None
    required: bool = True


class SurveySpec(BaseModel):
    """Data model for survey specification."""

    title: str
    description: str
    questions: List[Question]
    target_audience: str
    estimated_time: str
    required_responses: int


class Spec(Artifact[SurveySpec]):
    """Artifact representing a survey specification."""

    def __init__(self, data: Optional[SurveySpec] = None):
        super().__init__(data=data)
        self.metadata["type"] = "survey_specification"


SPEC_AGENT_PROMPT = """
You are a survey specification expert. Your role is to analyze survey requests \
and create detailed specifications that will guide the survey creation process. \
You should consider:
    1. The purpose and goals of the survey
    2. Target audience and their characteristics
    3. Appropriate question types and flow
    4. Estimated completion time
    5. Required number of responses
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
    "estimated_time": "string",
    "required_responses": integer
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

        try:
            spec_data = await self.get_structured_output(
                messages=messages, output_schema=SurveySpec
            )
            return Spec(data=spec_data)
        except Exception as e:
            print(f"Error generating specification: {str(e)}")
            error_spec = SurveySpec(
                title="Error in Specification Generation",
                description=f"Failed to generate proper specification: {str(e)}",
                questions=[],
                target_audience="Unknown",
                estimated_time="Unknown",
                required_responses=0,
            )
            return Spec(data=error_spec)

    def run(self, survey_request: str) -> Spec:
        """Generate a survey specification based on the request."""
        return asyncio.run(self.arun(survey_request))
