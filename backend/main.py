from models.survey import SurveySpec
from orchestrate import SurveyOrchestrator
import json
from openai import OpenAI, AsyncOpenAI
import os

from db import SurveyKongDB


async def main():
    # Initialize OpenAI clients
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Create an example survey request
    survey_request = """
    Create a customer satisfaction survey for a new mobile app. 
    We want to understand how users feel about the app's features, 
    usability, and overall experience. The survey should help us 
    identify areas for improvement and gather feedback on what users 
    like most about the app.
    """

    # Initialize the orchestrator with clients
    orchestrator = SurveyOrchestrator(client=client, async_client=async_client)

    # Run just the spec agent
    spec = await orchestrator.spec_agent.arun(survey_request)

    # Print the spec in a nicely formatted way
    print("\nSurvey Specification:")
    print("=" * 50)
    print(f"Title: {spec.data.title}")
    print(f"Description: {spec.data.description}")
    print(f"Target Audience: {spec.data.target_audience}")
    print(f"Estimated Time: {spec.data.estimated_time}")
    print(f"Required Responses: {spec.data.required_responses}")
    print("\nQuestions:")
    for i, question in enumerate(spec.data.questions, 1):
        print(f"\n{i}. {question.text}")
        print(f"   Type: {question.type}")
        if question.options:
            print("   Options:")
            for option in question.options:
                print(f"   - {option}")
        print(f"   Required: {question.required}")

    # Print metrics if available
    if "metrics" in spec.metadata:
        print("\nMetrics:")
        print("=" * 50)
        metrics = spec.metadata["metrics"]
        print(f"Duration: {metrics['duration_seconds']:.2f} seconds")
        print(f"API Calls: {metrics['api_calls']}")
        print(f"Tool Calls: {metrics['tool_calls']}")
        print(f"Tokens Used: {metrics['tokens_used']}")
        print(f"Error Count: {metrics['error_count']}")

    try:
        db = SurveyKongDB()
        print("Connection successful!")

        # Create a project
        project = db.create_project(
            {"title": "Demo Project", "description": "Test", "status": "draft"}
        )
        print("Inserted project:", project)

        # Fetch all projects
        projects = db.get_projects()
        print("All projects:", projects)

        if isinstance(spec, Spec):
            db_spec = db.create_survey_spec(project["id"], spec)
        else:
            db_spec = db.create_survey_spec(
                project["id"],
                SurveySpec(
                    **{"questions": [], "target_audience": "US adults", "version": 1}
                ),
            )
        print("Inserted survey spec:", db_spec)

        # Fetch all survey specs for the project
        specs = db.get_survey_specs_for_project(project["id"])
        print("Survey specs for project:", specs)

        db.close()
        print("Connection closed.")
    except Exception as e:
        print(f"Failed to connect or execute query: {e}")


if __name__ == "__main__":
    main()
