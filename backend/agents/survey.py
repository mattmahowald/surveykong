from typing import Optional
from agents.agent import Agent
from models.artifact import Artifact
from models.survey import SurveySpec, Survey, Question
import asyncio


class SurveyArtifact(Artifact[Survey]):
    """Artifact representing a generated survey with questions."""

    def __init__(self, data: Optional[Survey] = None):
        super().__init__(data=data)
        self.metadata["type"] = "survey_questions"


SURVEY_AGENT_PROMPT = """
You are a survey design expert. Your role is to create detailed, well-crafted survey questions \
based on a survey specification. You should:

1. Create questions that directly test the specified hypotheses
2. Use appropriate question types for the data needed
3. Ensure questions are clear, unbiased, and easy to understand
4. Include demographic questions if relevant to the target audience
5. Structure questions in a logical flow
6. Consider survey length based on the targeted completion time

Question types available:
- "multiple_choice": For categorical responses with predefined options
- "text": For open-ended text responses
- "rating": For scale-based responses (1-5, 1-10, etc.)
- "boolean": For yes/no questions

Please provide your response in JSON format with the following structure:
{
    "title": "string",
    "description": "string", 
    "questions": [
        {
            "text": "string",
            "type": "multiple_choice|text|rating|boolean",
            "options": ["string"] (required for multiple_choice, optional for rating),
            "required": boolean
        }
    ]
}
"""

SURVEY_UPDATE_PROMPT = """
You are a survey design expert. You will receive a survey specification, current survey questions, \
and feedback/changes to make. Your task is to update the survey questions based on the feedback \
while maintaining the survey's objectives and structure.

You should:
1. Make exactly the requested changes
2. Maintain question quality and clarity
3. Ensure questions still test the specified hypotheses
4. Keep the appropriate question types and flow
5. Preserve good survey design principles

Please provide your response in JSON format with the following structure:
{
    "title": "string",
    "description": "string", 
    "questions": [
        {
            "text": "string",
            "type": "multiple_choice|text|rating|boolean",
            "options": ["string"] (required for multiple_choice, optional for rating),
            "required": boolean
        }
    ]
}
"""


class SurveyAgent(Agent):
    """Agent responsible for generating detailed survey questions from specifications."""

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
        """Set up any tools needed by the survey agent."""
        # Add tools here if needed
        pass

    def get_system_prompt(self) -> str:
        return SURVEY_AGENT_PROMPT

    async def arun(self, survey_spec: SurveySpec) -> SurveyArtifact:
        """Generate detailed survey questions from a survey specification."""
        spec_json = survey_spec.model_dump_json(indent=2)
        
        messages = [
            {"role": "system", "content": SURVEY_AGENT_PROMPT},
            {
                "role": "user",
                "content": f"Please create detailed survey questions based on this survey specification:\n\n{spec_json}",
            },
        ]

        max_retries = 3
        retry_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                survey_data = await self.get_structured_output(
                    messages=messages, output_schema=Survey
                )
                return SurveyArtifact(data=survey_data)
            except Exception as e:
                print(f"Survey generation attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                    continue
                
                # If all retries failed, return a user-friendly error
                error_message = "We're having trouble generating your survey questions right now. "
                if "Circuit breaker is open" in str(e):
                    error_message += "Our AI service is temporarily unavailable. Please try again in a few minutes."
                else:
                    error_message += "Please try again or adjust your survey specification."

                error_survey = Survey(
                    title="Survey Generation Temporarily Unavailable",
                    description=error_message,
                    questions=[
                        Question(
                            text="Survey questions could not be generated at this time.",
                            type="text",
                            required=False
                        )
                    ]
                )
                return SurveyArtifact(data=error_survey)

    async def aupdate(self, survey_spec: SurveySpec, current_survey: dict, changes: str) -> SurveyArtifact:
        """Update survey questions based on feedback and changes."""
        spec_json = survey_spec.model_dump_json(indent=2)
        survey_json = Survey(**current_survey).model_dump_json(indent=2)
        
        messages = [
            {"role": "system", "content": SURVEY_UPDATE_PROMPT},
            {
                "role": "user", 
                "content": f"""
Survey Specification:
{spec_json}

Current Survey:
{survey_json}

Requested Changes:
{changes}

Please update the survey questions based on the requested changes.
                """,
            },
        ]

        max_retries = 3
        retry_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                survey_data = await self.get_structured_output(
                    messages=messages, output_schema=Survey
                )
                return SurveyArtifact(data=survey_data)
            except Exception as e:
                print(f"Survey update attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                    continue
                
                # If all retries failed, return the current survey with error message
                error_message = "We're having trouble updating your survey questions right now. "
                if "Circuit breaker is open" in str(e):
                    error_message += "Our AI service is temporarily unavailable. Please try again in a few minutes."
                else:
                    error_message += "Please try again or adjust your feedback."

                # Return current survey with error message  
                current_survey_obj = Survey(**current_survey)
                current_survey_obj.description = f"UPDATE ERROR: {error_message}"
                return SurveyArtifact(data=current_survey_obj)

    def run(self, survey_spec: SurveySpec) -> SurveyArtifact:
        """Synchronous version of survey generation."""
        return asyncio.run(self.arun(survey_spec))


