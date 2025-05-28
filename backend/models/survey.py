from typing import Optional, List
from pydantic import BaseModel, Field


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
    target_audience: str
    targeted_completion_time: str
    targeted_number_of_responses: int
    hypothesis_tested: List[str]
