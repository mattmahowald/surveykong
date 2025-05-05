from agents.spec import Spec, SpecAgent
from agents.survey import Survey, SurveyAgent
from agents.cohort import Cohort, CohortAgent
from agents.outbound import OutboundResults, OutboundAgent
from agents.analysis import AnalysisReport, AnalysisAgent


class SurveyOrchestrator:
    def __init__(self) -> None:
        self.spec_agent = SpecAgent()
        self.survey_agent = SurveyAgent()
        self.cohort_agent = CohortAgent()
        self.outbound_agent = OutboundAgent()
        self.analysis_agent = AnalysisAgent()

    def orchestrate(self, survey_request: str) -> AnalysisReport:
        spec: Spec = self.spec_agent.run(survey_request)
        survey: Survey = self.survey_agent.run(spec)
        cohort: Cohort = self.cohort_agent.run(survey)
        results: OutboundResults = self.outbound_agent.run(survey, cohort)
        return self.analysis_agent.run(results)
