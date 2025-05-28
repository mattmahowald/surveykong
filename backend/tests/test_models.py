"""
Simple unit tests for the backend that don't require external services
"""
import pytest
from models.survey import Question, SurveySpec
from models.artifact import Artifact
import time


def test_question_model():
    """Test Question model with Pydantic v2."""
    question = Question(
        text="How satisfied are you with our service?",
        type="rating",
        required=True
    )
    
    # Test serialization
    data = question.model_dump()
    assert data["text"] == "How satisfied are you with our service?"
    assert data["type"] == "rating"
    assert data["required"] is True
    assert data["options"] is None


def test_question_with_options():
    """Test Question model with multiple choice options."""
    question = Question(
        text="Which features do you use?",
        type="multiple_choice",
        options=["Feature A", "Feature B", "Feature C"],
        required=False
    )
    
    data = question.model_dump()
    assert len(data["options"]) == 3
    assert "Feature B" in data["options"]
    assert not data["required"]


def test_survey_spec():
    """Test SurveySpec model."""
    questions = [
        Question(text="Question 1", type="text"),
        Question(text="Question 2", type="boolean"),
    ]
    
    spec = SurveySpec(
        title="Customer Feedback Survey",
        description="Help us improve our service",
        questions=questions,
        target_audience="existing customers",
        estimated_time="5 minutes",
        required_responses=100
    )
    
    # Test model_dump (Pydantic v2 method)
    data = spec.model_dump()
    assert data["title"] == "Customer Feedback Survey"
    assert len(data["questions"]) == 2
    assert data["required_responses"] == 100
    
    # Test model_dump_json (Pydantic v2 method)
    json_str = spec.model_dump_json()
    assert isinstance(json_str, str)
    assert "Customer Feedback Survey" in json_str


def test_artifact_model():
    """Test generic Artifact model."""
    # Test with string data
    artifact1 = Artifact[str](
        data="test data",
        metadata={"source": "test", "version": 1}
    )
    
    assert artifact1.data == "test data"
    assert artifact1.metadata["source"] == "test"
    assert isinstance(artifact1.timestamp, float)
    
    # Test with dict data
    artifact2 = Artifact[dict](
        data={"key": "value", "number": 42}
    )
    
    dict_repr = artifact2.to_dict()
    assert dict_repr["data"]["number"] == 42
    assert "timestamp" in dict_repr
    assert "metadata" in dict_repr


def test_artifact_json_serialization():
    """Test Artifact JSON serialization."""
    artifact = Artifact[list](
        data=[1, 2, 3, 4, 5],
        metadata={"test": True}
    )
    
    json_str = artifact.to_json()
    assert isinstance(json_str, str)
    assert "[1, 2, 3, 4, 5]" in json_str or "[1,2,3,4,5]" in json_str


def test_question_type_validation():
    """Test that Question type field validates correctly."""
    # Valid types should work
    for valid_type in ["multiple_choice", "text", "rating", "boolean"]:
        q = Question(text="Test", type=valid_type)
        assert q.type == valid_type
    
    # Invalid type should raise error
    with pytest.raises(ValueError):
        Question(text="Test", type="invalid_type")


def test_pydantic_v2_features():
    """Test that we're using Pydantic v2 features correctly."""
    spec = SurveySpec(
        title="Test",
        description="Test survey",
        questions=[],
        target_audience="everyone",
        estimated_time="1 minute",
        required_responses=10
    )
    
    # These are v2-specific methods
    assert hasattr(spec, 'model_dump')
    assert hasattr(spec, 'model_dump_json')
    assert hasattr(spec, 'model_json_schema')
    
    # Should NOT have v1 methods
    assert not hasattr(spec, 'dict')
    assert not hasattr(spec, 'json')
