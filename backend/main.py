from orchestrate import SurveyOrchestrator

if __name__ == "__main__":
    survey_request = input("Enter your research question: ")
    orchestrator = SurveyOrchestrator()
    orchestrator.orchestrate(survey_request)
