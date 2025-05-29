from agents.spec import Spec, SpecAgent
from agents.survey import SurveyArtifact, SurveyAgent
from agents.cohort import CohortArtifact, CohortAgent
from agents.outbound import OutboundResults, OutboundAgent
from agents.analysis import AnalysisReport, AnalysisAgent


class SurveyOrchestrator:
    def __init__(self, client, async_client) -> None:
        self.spec_agent = SpecAgent(client=client, async_client=async_client)
        self.survey_agent = SurveyAgent(client=client, async_client=async_client)
        self.cohort_agent = CohortAgent(client=client, async_client=async_client)
        # self.outbound_agent = OutboundAgent(client=client, async_client=async_client)
        # self.analysis_agent = AnalysisAgent(client=client, async_client=async_client)

    def orchestrate(self, survey_request: str) -> AnalysisReport:
        spec: Spec = self.spec_agent.run(survey_request)
        return spec
        # survey: SurveyArtifact = self.survey_agent.run(spec.data)
        # cohort: CohortArtifact = self.cohort_agent.run(survey)
        # results: OutboundResults = self.outbound_agent.run(survey, cohort)
        # return self.analysis_agent.run(results)
