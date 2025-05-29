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
    questions: List[Question]
    target_audience: str
    targeted_completion_time: str
    targeted_number_of_responses: int
    hypothesis_tested: List[str]


class Survey(BaseModel):
    """Data model for generated survey questions."""

    title: str
    description: str
    questions: List[Question]
    spec_id: Optional[str] = None  # Reference to the spec that generated this survey


class Cohort(BaseModel):
    target_audience: str
    inclusion_criteria: List[str]
    exclusion_criteria: List[str]
    estimated_pool_size: Optional[str] = None
    recruitment_notes: Optional[str] = None
